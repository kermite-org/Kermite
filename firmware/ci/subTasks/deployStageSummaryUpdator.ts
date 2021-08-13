import { IFirmwareMetadataJson } from "subTasks/common";
import {
  execueteOneliner,
  fsCopyFileSync,
  fsxReadJsonFile,
  fsxWriteJsonFile,
  globSync,
  pathBasename,
  pathDirname,
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

interface IFirmwareInfo {
  firmwareId: string;
  firmwareProjectPath: string;
  variationName: string;
  targetDevice: "atmega32u4" | "rp2040";
  buildResult: "success" | "failure";
  firmwareFileName: string;
  metadataFileName: string;
  releaseBuildRevision: number;
  buildTimestamp: string;
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
  firmwares: IFirmwareInfo[];
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
  const m = text.match(/^arm-none-eabi-gcc \(.* (.+?)\) (.+?) (.+?) /m);
  return (m && `arm-none-eabi-gcc ${m[1]} ${m[2]} ${m[3]}`) || "";
}

function readEnvironmentVersions(): IEnvironmentVersions {
  const osVersion = readOsVersion();
  const avrGccVersion = execueteOneliner(`avr-gcc --version | grep "avr-gcc"`);
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
  const firmwareMetadataFilePaths = globSync(
    "./dist/firmwares/**/*.metadata.json"
  );

  const firmwareInfos: IFirmwareInfo[] = firmwareMetadataFilePaths.map(
    (firmwareMetadataFilePath) => {
      const firmwareProjectPath = pathDirname(
        pathRelative("./dist/firmwares", firmwareMetadataFilePath)
      );
      const me = fsxReadJsonFile(
        firmwareMetadataFilePath
      ) as IFirmwareMetadataJson;
      return {
        firmwareId: me.firmwareId,
        firmwareProjectPath,
        variationName: me.variationName,
        targetDevice: me.targetDevice,
        buildResult: me.buildResult,
        firmwareFileName: me.firmwareFileName,
        metadataFileName: pathBasename(firmwareMetadataFilePath),
        releaseBuildRevision: me.releaseBuildRevision,
        buildTimestamp: me.buildTimestamp,
      };
    }
  );

  return {
    info: {
      buildStats,
      environment: readEnvironmentVersions(),
      updateAt: timeNow(),
      filesRevision,
    },
    firmwares: firmwareInfos,
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
    fsCopyFileSync("./KRS/resources2/summary.json", "./dist/summary.json");
  }
}
