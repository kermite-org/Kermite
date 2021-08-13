import {
  fsCopyFileSync,
  fsxReadJsonFile,
  fsxWriteJsonFile,
  globSync,
  pathBasename,
  pathDirname,
  pathRelative,
  timeNow,
} from "../helpers";
import { IFirmwareMetadataJson } from "./common";
import {
  IEnvironmentVersions,
  readEnvironmentVersions,
} from "./toolsVersionReader";

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

interface ISummaryData {
  info: {
    buildStats: IBuildStats;
    environment: IEnvironmentVersions;
    updateAt: string;
    filesRevision: number;
  };
  firmwares: IFirmwareInfo[];
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
