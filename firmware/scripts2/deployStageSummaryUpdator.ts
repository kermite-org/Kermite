import { createObjectFromKeyValues } from "./helpers";
import {
  execueteOneliner,
  fsCopyFileSync,
  fsxReadJsonFile,
  fsxWriteJsonFile,
  globSync,
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

interface ILayoutJsonPartial {
  projectId: string;
  projectName: string;
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
  path: string;
  id: string;
  name: string;
  status: "success" | "failure";
  revision: number;
  updatedAt: string;
  hexFileSize: number;
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
  projects: { [key in string]: IProjectInfo };
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
  const layoutFilePahts = globSync("./dist/variants/**/layout.json");
  const projectInfos = createObjectFromKeyValues(
    layoutFilePahts.map((filePath) => {
      const projectPath = pathDirname(
        pathRelative("./dist/variants", filePath)
      );
      const layoutObj = fsxReadJsonFile(filePath) as ILayoutJsonPartial;
      const { projectId, projectName } = layoutObj;
      const metadataFilePath = `./dist/variants/${projectPath}/metadata.json`;
      const metadataObj = fsxReadJsonFile(metadataFilePath) as IMetadataJson;
      const {
        buildResult: buildStatus,
        releaseBuildRevision: buildRevision,
        buildTimestamp: updatedAt,
        hexFileSize,
      } = metadataObj;

      return [
        projectPath,
        {
          path: projectPath,
          id: projectId,
          name: projectName,
          status: buildStatus,
          revision: buildRevision,
          updatedAt,
          hexFileSize,
        },
      ];
    })
  );
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
