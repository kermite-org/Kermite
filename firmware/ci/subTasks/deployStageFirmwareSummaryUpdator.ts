import {
  fsCopyFileSync,
  fsExistsSync,
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
  // targetDevice: "atmega32u4" | "rp2040";
  targetDevice: "rp2040";
  buildResult: "success" | "failure";
  firmwareFileName: string;
  metadataFileName: string;
  releaseBuildRevision: number;
  buildTimestamp: string;
}

interface IFirmwareSummaryData {
  info: {
    buildStats: IBuildStats;
    environment: IEnvironmentVersions;
    updateAt: string;
    filesRevision: number;
  };
  firmwares: IFirmwareInfo[];
}

function makeFirmwareSummaryFileContent(
  buildStats: IBuildStats,
  filesRevision: number
): IFirmwareSummaryData {
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

export function deployStageFirmwareSummaryUpdator_outputSummaryFile(
  buildStats: IBuildStats,
  changeRes: IIndexUpdatorResult
) {
  const { filesChanged, filesRevision } = changeRes;

  const sourceSummaryFilePath = "./KRS/resources2/index.firmwares.json";
  const distSummaryFilePath = "./dist/index.firmwares.json";
  if (!filesChanged && fsExistsSync(sourceSummaryFilePath)) {
    fsCopyFileSync(sourceSummaryFilePath, distSummaryFilePath);
  } else {
    const savingSummaryObj = makeFirmwareSummaryFileContent(
      buildStats,
      filesRevision
    );
    fsxWriteJsonFile(distSummaryFilePath, savingSummaryObj);
  }
}
