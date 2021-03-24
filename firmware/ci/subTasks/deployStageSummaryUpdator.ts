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
  pathJoin,
  pathRelative,
  timeNow,
} from "../helpers";

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
  storageFormatRevision: number;
  messageProtocolRevision: number;
  flashUsage: number;
  ramUsage: number;
  firmwareFileSize: number;
  firmwareBinaryFileMD5: string;
  variationName: string;
  targetDevice: "atmega32u4" | "rp2040";
  firmwareFileName: string;
}

interface IProjectInfo {
  projectId: string;
  projectPath: string;
  keyboardName: string;
  layoutNames: string[];
  presetNames: string[];
  firmwares: {
    variationName: string;
    targetDevice: "atmega32u4" | "rp2040";
    binaryFileName: string;
    buildRevision: number;
    buildTimestamp: string;
    romUsage: number;
    ramUsage: number;
  }[];
}

interface IEnvironmentVersions {
  OS: string;
  make: string;
  "avr-gcc": string;
  "arm-none-eabi-gcc": string;
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

function readArmNoneEabiGccVersion(): string {
  const text = execueteOneliner("arm-none-eabi-gcc --version");
  const m = text.match(
    /^arm-none-eabi-gcc \(GNU Tools for Arm Embedded Processors (.+?)\) (.+?) (.+?) /m
  );
  return (m && `arm-none-eabi-gcc ${m[1]} ${m[2]} ${m[3]}`) || "";
}

function readEnvironmentVersions(): IEnvironmentVersions {
  const osVersion = readOsVersion();
  const avrGccVersion = execueteOneliner(
    `avr-gcc -v 2>&1 >/dev/null | grep "gcc version"`
  );
  const makeVersion = execueteOneliner(`make -v | grep "GNU Make"`);
  const armNoneEabiGccVersion = readArmNoneEabiGccVersion();
  return {
    OS: osVersion,
    make: makeVersion,
    "avr-gcc": avrGccVersion,
    "arm-none-eabi-gcc": armNoneEabiGccVersion,
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

    let presetNames: string[] = [];

    const profilesDir = `./dist/variants/${projectPath}/profiles`;
    if (fsExistsSync(profilesDir)) {
      presetNames = fsReaddirSync(profilesDir)
        .filter((fileName) => fileName.endsWith(".profile.json"))
        .map((fileName) => pathBasename(fileName, ".profile.json"));
    }

    const layoutNames = fsReaddirSync(`./dist/variants/${projectPath}`)
      .filter((fileName) => fileName.endsWith(".layout.json"))
      .map((fileName) => pathBasename(fileName, ".layout.json"));

    const metadataFileNames = fsReaddirSync(
      `./dist/variants/${projectPath}`
    ).filter((fileName) => fileName.match(/^metadata_.*\.json$/));

    const firmwares = metadataFileNames
      .map((metadataFileName) => {
        const filePath = pathJoin(
          `./dist/variants/${projectPath}`,
          metadataFileName
        );
        return fsxReadJsonFile(filePath) as IMetadataJson;
      })
      .filter((metadata) => metadata.buildResult === "success")
      .map((md) => ({
        variationName: md.variationName,
        targetDevice: md.targetDevice,
        binaryFileName: md.firmwareFileName,
        buildRevision: md.releaseBuildRevision,
        buildTimestamp: md.buildTimestamp,
        romUsage: md.flashUsage,
        ramUsage: md.ramUsage,
      }));

    return {
      projectPath: projectPath,
      projectId: projectObj.projectId,
      keyboardName: projectObj.keyboardName,
      layoutNames,
      presetNames,
      firmwares,
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
