import {
  executeCommand,
  fsCopyFileSync,
  fsExistsSync,
  fsReaddirSync,
  fsStatSync,
  fsxCopyDirectory,
  fsxMakeDirectory,
  fsxReadJsonFile,
  fsxReadTextFile,
  fsxWriteJsonFile,
  fsxWriteTextFile,
  generateMd5,
  globSync,
  pathBasename,
  pathDirname,
  pathJoin,
  pathRelative,
  timeNow,
} from "./osHelpers";
import { arrayCount, getMatched, puts, stringifyArray } from "./helpers";

function gatherTargetProjectPaths() {
  return globSync("./src/projects/**/rules.mk")
    .map((fpath) => pathDirname(fpath))
    .filter((fpath) => fsExistsSync(pathJoin(fpath, "project.json")))
    .map((fpath) => pathRelative("src/projects", fpath));
}

function loadFirmwareCommonRevisions(): ICommonRevisions {
  const versionFilePath = "./src/modules/versions.h";
  const content = fsxReadTextFile(versionFilePath);
  return {
    storageFormatRevision: parseInt(
      getMatched(content, /^\#define CONFIG_STORAGE_FORMAT_REVISION (\d+)$/m)!
    ),
    messageProtocolRevision: parseInt(
      getMatched(content, /^\#define RAWHID_MESSAGE_PROTOCOL_REVISION (\d+)$/m)!
    ),
  };
}

interface ICommonRevisions {
  storageFormatRevision: number;
  messageProtocolRevision: number;
}

interface IProjectSourceAttributes {
  releaseBuildRevision: number;
  hexFileMD5?: string;
  buildTimestamp?: string;
}

function loadProjectSourceAttributes(
  projectPath: string
): IProjectSourceAttributes {
  const metadataFilePath = `./KRS/resources/variants/${projectPath}/metadata.json`;

  if (fsExistsSync(metadataFilePath)) {
    const obj = fsxReadJsonFile(metadataFilePath);
    return {
      releaseBuildRevision: obj.releaseBuildRevision || 0,
      hexFileMD5: obj.hexFileMD5,
      buildTimestamp: obj.buildTimestamp,
    };
  }

  return {
    releaseBuildRevision: 0,
  };
}

function makeProjectBuild(projectPath: string, buildRevision: number) {
  const command = `make ${projectPath}:build RELEASE_REVISION=${buildRevision}`;
  const [_stdout, stderr, status] = executeCommand(command);
  if (status !== 0) {
    throw `>${command}\n${stderr}`;
  }
}

function checkBinarySize(projectPath: string): { flash: number; ram: number } {
  const sizeCommand = `make ${projectPath}:size`;
  const [sizeOutputLines] = executeCommand(sizeCommand);
  const usageProg = parseFloat(
    getMatched(sizeOutputLines, /^Program.*\(([\d.]+)% Full\)/m)!
  );
  const usageData = parseFloat(
    getMatched(sizeOutputLines, /^Data.*\(([\d.]+)% Full\)/m)!
  );
  if (!(usageProg < 100.0 && usageData < 100.0)) {
    throw `firmware footprint overrun (FLASH: ${usageProg}%, RAM: ${usageData}%)`;
  }
  return {
    flash: usageProg,
    ram: usageData,
  };
}

interface IOutputHexFileInfo {
  size: number;
  md5: string;
}

function readOutputHexInfo(projectPath: string): IOutputHexFileInfo {
  const coreName = pathBasename(projectPath);
  const hexFilePath = `./build/${projectPath}/${coreName}.hex`;
  const hexFileContent = fsxReadTextFile(hexFilePath);
  const stat = fsStatSync(hexFilePath);
  return {
    size: stat.size,
    md5: generateMd5(hexFileContent),
  };
}

interface IProjectBuildResultUpdatedAttrs {
  releaseBuildRevision: number;
  buildTimestamp: string;
  flashUsage: number;
  ramUsage: number;
  hexFileSize: number;
  hexFileMD5: string;
}

function projectBuildPipeline(
  projectPath: string,
  sourceAttrs: IProjectSourceAttributes
): IProjectBuildResultUpdatedAttrs {
  const { releaseBuildRevision: buildRevision } = sourceAttrs;

  executeCommand(`make ${projectPath}:purge`);
  makeProjectBuild(projectPath, buildRevision);
  const sizeRes = checkBinarySize(projectPath);
  const info = readOutputHexInfo(projectPath);

  if (info.md5 == sourceAttrs.hexFileMD5) {
    return {
      releaseBuildRevision: buildRevision,
      buildTimestamp: sourceAttrs.buildTimestamp || timeNow(),
      flashUsage: sizeRes.flash,
      ramUsage: sizeRes.ram,
      hexFileSize: info.size,
      hexFileMD5: info.md5,
    };
  }

  const nextBuildRevision = buildRevision + 1;
  executeCommand(`make ${projectPath}:purge`);
  makeProjectBuild(projectPath, nextBuildRevision);
  const nextInfo = readOutputHexInfo(projectPath);
  return {
    releaseBuildRevision: nextBuildRevision,
    buildTimestamp: timeNow(),
    flashUsage: sizeRes.flash,
    ramUsage: sizeRes.ram,
    hexFileSize: nextInfo.size,
    hexFileMD5: nextInfo.md5,
  };
}

function makeFailureMetadataContent(sourceAttrs: IProjectSourceAttributes) {
  return {
    buildResult: "failure",
    releaseBuildRevision: sourceAttrs.releaseBuildRevision,
    buildTimestamp: sourceAttrs.buildTimestamp,
  };
}

function makeSuccessMetadataContent(
  updatedAttrs: IProjectBuildResultUpdatedAttrs,
  commonRevisions: ICommonRevisions
) {
  const ua = updatedAttrs;
  return {
    buildResult: "success",
    releaseBuildRevision: ua.releaseBuildRevision,
    buildTimestamp: ua.buildTimestamp,
    storageFormatRevision: commonRevisions.storageFormatRevision,
    messageProtocolRevision: commonRevisions.messageProtocolRevision,
    flashUsage: ua.flashUsage,
    ramUsage: ua.ramUsage,
    hexFileSize: ua.hexFileSize,
    hexFileMD5: ua.hexFileMD5,
  };
}

function buildProjectEntry(
  projectPath: string,
  commonRevisions: ICommonRevisions
): boolean {
  puts(`build ${projectPath} ...`);

  const coreName = pathBasename(projectPath);
  const srcDir = `./src/projects/${projectPath}`;
  const midDir = `./build/${projectPath}`;
  const destDir = `./dist/variants/${projectPath}`;

  fsxMakeDirectory(destDir);

  const sourceAttrs = loadProjectSourceAttributes(projectPath);

  fsCopyFileSync(`${srcDir}/project.json`, `${destDir}/project.json`);

  const layoutFileNames = fsReaddirSync(srcDir).filter((fileName) =>
    fileName.endsWith("layout.json")
  );
  layoutFileNames.forEach((fileName) =>
    fsCopyFileSync(`${srcDir}/${fileName}`, `${destDir}/${fileName}`)
  );

  if (fsExistsSync(`${srcDir}/presets`)) {
    fsxCopyDirectory(`${srcDir}/presets`, `${destDir}/presets`);
  }

  try {
    const updatedAttrs = projectBuildPipeline(projectPath, sourceAttrs);
    fsCopyFileSync(`${midDir}/${coreName}.hex`, `${destDir}/${coreName}.hex`);
    const metadataObj = makeSuccessMetadataContent(
      updatedAttrs,
      commonRevisions
    );
    fsxWriteJsonFile(`${destDir}/metadata.json`, metadataObj);
    puts(`build ${projectPath} ... OK`);
    return true;
  } catch (error) {
    puts(error);
    fsxWriteTextFile(`${destDir}/build_error.log`, error);
    const metadataObj = makeFailureMetadataContent(sourceAttrs);
    fsxWriteJsonFile(`${destDir}/metadata.json`, metadataObj);
    puts(`build ${projectPath} ... NG`);
    puts();
    return false;
  }
}

interface IBuildStats {
  numSuccess: number;
  numTotal: number;
}

export function deployStageProjectsBuilder_buildProjects(): IBuildStats {
  executeCommand("make clean");
  fsxMakeDirectory("dist");
  const projectPaths = gatherTargetProjectPaths();
  puts(`projects: ${stringifyArray(projectPaths)}`);
  const commonRevisions = loadFirmwareCommonRevisions();
  const results = projectPaths.map((pp) =>
    buildProjectEntry(pp, commonRevisions)
  );
  const numSuccess = arrayCount(results, (a) => !!a);
  const numTotal = results.length;
  puts(`build stats: ${numSuccess}/${numTotal}`);
  return { numSuccess, numTotal };
}
