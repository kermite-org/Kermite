import {
  execueteOneliner,
  fsCopyFileSync,
  fsExistsSync,
  fsReaddirSync,
  fsxReadJsonFile,
  fsxWriteJsonFile,
  globSync,
  pathBasename,
  pathDirname,
  pathRelative,
  timeNow,
} from "./osHelpers";

interface IBuildStats {
  numSuccess: number;
  numTotal: number;
}
interface IIndexUpdatorResult {
  filesChanged: boolean;
  filesRevision: number;
}

interface IProjectJsonPartial {
  projectId: string;
  keyboardName: string;
}

interface IMetadataJson {
  buildResult: "success" | "failure";
  releaseBuildRevision: number;
  buildTimestamp: string;
  flashUsage: number;
  ramUsage: number;
  hexFileSize: number;
  hexFileMD5: string;
}

interface IProjectInfo {
  projectPath: string;
  projectId: string;
  keyboardName: string;
  buildStatus: "success" | "failure";
  revision: number;
  updatedAt: string;
  hexFileSize: number;
  layoutNames: string[];
  presetNames: string[];
}

interface IEnvironmentVersions {
  OS: string;
  "avr-gcc": string;
  make: string;
}

interface ISummaryData {
  info: {
    buildStats: IBuildStats;
    environment: IEnvironmentVersions;
    updateAt: string;
    filesRevision: number;
  };
  projects: IProjectInfo[];
}

function readOsVersion(): string {
  const isMacOS = process.platform === "darwin";
  const isLinux = process.platform === "linux";
  const isWindows = process.platform === "win32";

  if (isMacOS) {
    const namePart = execueteOneliner(`sw_vers -productName`);
    const versionPart = execueteOneliner(`sw_vers -productVersion`);
    return `${namePart} ${versionPart}`;
  } else if (isLinux) {
    return execueteOneliner(`lsb_release -d`)
      .replace("Description:", "")
      .trim();
  } else if (isWindows) {
    return execueteOneliner(`ver`);
  }
  return "";
}

function readEnvironmentVersions(): IEnvironmentVersions {
  const osVersion = readOsVersion();
  const avrGccVersion = execueteOneliner(
    `avr-gcc -v 2>&1 >/dev/null | grep "gcc version"`
  );
  const makeVersion = execueteOneliner(`make -v | grep "GNU Make"`);
  return {
    OS: osVersion,
    "avr-gcc": avrGccVersion,
    make: makeVersion,
  };
}

function makeSummaryFileContent(
  buildStats: IBuildStats,
  filesRevision: number
): ISummaryData {
  const projectJsonFilePahts = globSync("./dist/variants/**/project.json");
  const projectInfos = projectJsonFilePahts.map((projectJsonFilePath) => {
    const projectPath = pathDirname(
      pathRelative("./dist/variants", projectJsonFilePath)
    );
    const projectObj = fsxReadJsonFile(
      projectJsonFilePath
    ) as IProjectJsonPartial;
    const metadataFilePath = `./dist/variants/${projectPath}/metadata.json`;
    const meta = fsxReadJsonFile(metadataFilePath) as IMetadataJson;

    let presetNames: string[] = [];

    const presetsDir = `./dist/variants/${projectPath}/profiles`;
    if (fsExistsSync(presetsDir)) {
      presetNames = fsReaddirSync(presetsDir)
        .filter((fileName) => fileName.endsWith(".json"))
        .map((fileName) => pathBasename(fileName, ".json"));
    }

    const layoutNames = fsReaddirSync(`./dist/variants/${projectPath}`)
      .filter((fileName) => fileName.endsWith(".layout.json"))
      .map((fileName) => pathBasename(fileName, ".layout.json"));

    return {
      projectPath: projectPath,
      projectId: projectObj.projectId,
      keyboardName: projectObj.keyboardName,
      buildStatus: meta.buildResult,
      revision: meta.releaseBuildRevision,
      updatedAt: meta.buildTimestamp,
      hexFileSize: meta.hexFileSize,
      layoutNames,
      presetNames,
    };
  });
  return {
    info: {
      buildStats,
      environment: readEnvironmentVersions(),
      updateAt: timeNow(),
      filesRevision,
    },
    projects: projectInfos,
  };
}

export function deployStageSummaryUpdator_outputSummaryFile(
  buildStats: IBuildStats,
  changeRes: IIndexUpdatorResult
) {
  const { filesChanged, filesRevision } = changeRes;
  if (filesChanged) {
    const savingSummaryObj = makeSummaryFileContent(buildStats, filesRevision);
    fsxWriteJsonFile("./dist/summary.json", savingSummaryObj);
  } else {
    fsCopyFileSync("./KRS/resources/summary.json", "./dist/summary.json");
  }
}
