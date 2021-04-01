import {
  arrayCount,
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
  getMatched,
  globSync,
  pathBasename,
  pathDirname,
  pathJoin,
  pathRelative,
  puts,
  stringifyArray,
  timeNow,
  uniqueArrayItemsDeep,
} from "../helpers";

type ITargetDevice = "atmega32u4" | "rp2040";

function gatherTargetProjectVariationPaths() {
  return globSync("./src/projects/**/rules.mk")
    .map((fpath) => pathDirname(fpath))
    .filter(
      (fpath) =>
        fsExistsSync(pathJoin(fpath, "config.h")) &&
        fsExistsSync(pathJoin(pathDirname(fpath), "project.json"))
    )
    .map((fpath) => pathRelative("src/projects", fpath));
}

function loadFirmwareCommonRevisions(): ICommonRevisions {
  const versionFilePath = "./src/modules/km0/keyboard/versions.h";
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
  firmwareBinaryFileMD5?: string;
  buildTimestamp?: string;
}

function loadProjectSourceAttributes(
  projectPath: string,
  variationName: string
): IProjectSourceAttributes {
  const metadataFilePath = `./KRS/resources/variants/${projectPath}/metadata_${variationName}.json`;

  if (fsExistsSync(metadataFilePath)) {
    const obj = fsxReadJsonFile(metadataFilePath);
    return {
      releaseBuildRevision: obj.releaseBuildRevision || 0,
      firmwareBinaryFileMD5: obj.firmwareBinaryFileMD5,
      buildTimestamp: obj.buildTimestamp,
    };
  }

  return {
    releaseBuildRevision: 0,
  };
}

function makeFirmwareBuild(
  projectPath: string,
  variationName: string,
  buildRevision: number
) {
  const command = `make ${projectPath}:${variationName}:build RELEASE_REVISION=${buildRevision} IS_RESOURCE_ORIGIN_ONLINE=1`;
  const [_stdout, stderr, status] = executeCommand(command);
  // console.log(_stdout);
  if (status !== 0) {
    throw `>${command}\n${stderr}`;
  }
}

function checkFirmwareBinarySize(
  projectPath: string,
  variationName: string,
  targetDevice: ITargetDevice
): { flash: number; ram: number } {
  const sizeCommand = `make ${projectPath}:${variationName}:size`;
  const [sizeOutputText] = executeCommand(sizeCommand);

  let usageProg = -1;
  let usageData = -1;
  if (targetDevice === "atmega32u4") {
    usageProg = parseFloat(
      sizeOutputText.match(/^Program.*\(([\d.]+)% Full\)/m)![1]
    );
    usageData = parseFloat(
      sizeOutputText.match(/^Data.*\(([\d.]+)% Full\)/m)![1]
    );
  } else if (targetDevice == "rp2040") {
    usageProg = parseFloat(sizeOutputText.match(/FLASH:.*\s([\d.]+)%/m)![1]);
    usageData = parseFloat(sizeOutputText.match(/RAM:.*\s([\d.]+)%/m)![1]);
  } else {
    throw "unexpected size command output";
  }
  if (
    !(0 < usageProg && usageProg < 100.0 && 0 < usageData && usageData < 100.0)
  ) {
    throw `firmware footprint overrun (FLASH: ${usageProg}%, RAM: ${usageData}%)`;
  }
  return {
    flash: usageProg,
    ram: usageData,
  };
}

interface IOutputFirmwareFileInfo {
  size: number;
  md5: string;
}

function readOutputBinaryFileInfo(
  projectPath: string,
  variationName: string,
  firmwareFileName: string
): IOutputFirmwareFileInfo {
  const firmwareFilePath = `./build/${projectPath}/${variationName}/${firmwareFileName}`;
  const firmwareFileContent = fsxReadTextFile(firmwareFilePath);
  const stat = fsStatSync(firmwareFilePath);
  return {
    size: stat.size,
    md5: generateMd5(firmwareFileContent),
  };
}

interface IProjectBuildResultUpdatedAttrs {
  releaseBuildRevision: number;
  buildTimestamp: string;
  flashUsage: number;
  ramUsage: number;
  firmwareFileSize: number;
  firmwareBinaryFileMD5: string;
  variationName: string;
  targetDevice: ITargetDevice;
  firmwareFileName: string;
}

function projectBuildPipeline(
  projectPath: string,
  variationName: string,
  targetDevice: ITargetDevice,
  sourceAttrs: IProjectSourceAttributes,
  firmwareFileName: string
): IProjectBuildResultUpdatedAttrs {
  const { releaseBuildRevision: buildRevision } = sourceAttrs;

  executeCommand(`make ${projectPath}:${variationName}:clean_app`);
  makeFirmwareBuild(projectPath, variationName, buildRevision);
  const sizeRes = checkFirmwareBinarySize(
    projectPath,
    variationName,
    targetDevice
  );
  const info = readOutputBinaryFileInfo(
    projectPath,
    variationName,
    firmwareFileName
  );

  if (info.md5 == sourceAttrs.firmwareBinaryFileMD5) {
    return {
      releaseBuildRevision: buildRevision,
      buildTimestamp: sourceAttrs.buildTimestamp || timeNow(),
      flashUsage: sizeRes.flash,
      ramUsage: sizeRes.ram,
      firmwareFileSize: info.size,
      firmwareBinaryFileMD5: info.md5,
      variationName,
      targetDevice,
      firmwareFileName,
    };
  }

  const nextBuildRevision = buildRevision + 1;
  executeCommand(`make ${projectPath}:${variationName}:clean_app`);
  makeFirmwareBuild(projectPath, variationName, nextBuildRevision);
  const nextInfo = readOutputBinaryFileInfo(
    projectPath,
    variationName,
    firmwareFileName
  );
  return {
    releaseBuildRevision: nextBuildRevision,
    buildTimestamp: timeNow(),
    flashUsage: sizeRes.flash,
    ramUsage: sizeRes.ram,
    firmwareFileSize: nextInfo.size,
    firmwareBinaryFileMD5: nextInfo.md5,
    variationName,
    targetDevice,
    firmwareFileName,
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
    firmwareFileSize: ua.firmwareFileSize,
    firmwareBinaryFileMD5: ua.firmwareBinaryFileMD5,
    variationName: ua.variationName,
    targetDevice: ua.targetDevice,
    firmwareFileName: ua.firmwareFileName,
  };
}

function detectTargetDeviceFromRulesMk(
  projectVariationPath: string
): ITargetDevice | undefined {
  const rulesMkFilePath = pathJoin(
    "src/projects",
    projectVariationPath,
    "rules.mk"
  );
  const content = fsxReadTextFile(rulesMkFilePath);
  const m = content.match(/^TARGET_MCU\s?=\s?(.+)$/m);
  return (m?.[1] as ITargetDevice) || undefined;
}

function buildProjectVariationEntry(
  projectVariationPath: string,
  commonRevisions: ICommonRevisions
): boolean {
  const projectPath = pathDirname(projectVariationPath);
  const variationName = pathBasename(projectVariationPath);
  const projectName = pathBasename(projectPath);

  const targetName = `${projectPath}--${variationName}`;

  puts(`build ${targetName} ...`);

  const targetDevice = detectTargetDeviceFromRulesMk(projectVariationPath);
  if (!targetDevice) {
    throw `cannot detecte target device for ${targetName}`;
  }
  const extension = targetDevice === "atmega32u4" ? "hex" : "uf2";

  // const srcDir = `./src/projects/${projectVariationPath}`;
  const midDir = `./build/${projectVariationPath}`;
  const destDir = `./dist/variants/${projectPath}`;

  fsxMakeDirectory(destDir);

  const sourceAttrs = loadProjectSourceAttributes(projectPath, variationName);

  const firmwareFileName = `${projectName}_${variationName}.${extension}`;

  try {
    const updatedAttrs = projectBuildPipeline(
      projectPath,
      variationName,
      targetDevice,
      sourceAttrs,
      firmwareFileName
    );
    fsCopyFileSync(
      `${midDir}/${firmwareFileName}`,
      `${destDir}/${firmwareFileName}`
    );
    const metadataObj = makeSuccessMetadataContent(
      updatedAttrs,
      commonRevisions
    );
    fsxWriteJsonFile(`${destDir}/metadata_${variationName}.json`, metadataObj);
    puts(`build ${targetName} ... OK`);
    return true;
  } catch (error) {
    puts(error);
    fsxWriteTextFile(`${destDir}/build_error_${variationName}.log`, error);
    const metadataObj = makeFailureMetadataContent(sourceAttrs);
    fsxWriteJsonFile(`${destDir}/metadata_${variationName}.json`, metadataObj);
    puts(`build ${targetName} ... NG`);
    puts();
    return false;
  }
}

function copyProjectDataResources(projectPath: string) {
  const srcDir = `./src/projects/${projectPath}`;
  const destDir = `./dist/variants/${projectPath}`;

  fsCopyFileSync(`${srcDir}/project.json`, `${destDir}/project.json`);
  const layoutFileNames = fsReaddirSync(srcDir).filter((fileName) =>
    fileName.endsWith(".layout.json")
  );
  layoutFileNames.forEach((fileName) =>
    fsCopyFileSync(`${srcDir}/${fileName}`, `${destDir}/${fileName}`)
  );
  if (fsExistsSync(`${srcDir}/profiles`)) {
    fsxCopyDirectory(`${srcDir}/profiles`, `${destDir}/profiles`);
  }
}

interface IBuildStats {
  numSuccess: number;
  numTotal: number;
}

export function deployStageProjectsBuilder_buildProjects(): IBuildStats {
  executeCommand("make clean");
  fsxMakeDirectory("dist");
  const projectVariationPaths = gatherTargetProjectVariationPaths();
  puts(`projectVariations: ${stringifyArray(projectVariationPaths)}`);
  const commonRevisions = loadFirmwareCommonRevisions();
  const results = projectVariationPaths.map((pp) =>
    buildProjectVariationEntry(pp, commonRevisions)
  );
  const projectPaths = uniqueArrayItemsDeep(
    projectVariationPaths.map((pp) => pathDirname(pp))
  );
  projectPaths.forEach(copyProjectDataResources);

  const numSuccess = arrayCount(results, (a) => !!a);
  const numTotal = results.length;
  puts(`build stats: ${numSuccess}/${numTotal}`);
  return { numSuccess, numTotal };
}
