import {
  fsExistsSync,
  fsxReadTextFile,
  getMatched,
  globSync,
  pathDirname,
  pathJoin,
  pathRelative,
  stringifyArray,
  uniqueArrayItems,
  uniqueArrayItemsDeep,
} from "./helpers";

process.chdir("..");

const AbortOnError = process.argv.includes("--abortOnError");

function getAllProjectVariationPaths() {
  return globSync("src/projects/**/rules.mk")
    .map((filePath) => pathDirname(filePath))
    .filter((filePath) => fsExistsSync(pathJoin(filePath, "config.h")))
    .map((filePath) => pathRelative("src/projects", filePath))
    .filter((vp) => !(vp.startsWith("dev/") || vp.startsWith("study/")));
}

interface IProjectInfo {
  projectPath: string;
  projectId: string;
}

function loadProjectInfo(projectVariationPath: string): IProjectInfo {
  const projectPath = pathDirname(projectVariationPath);
  const configFilePath = `./src/projects/${projectVariationPath}/config.h`;

  const configContent = fsxReadTextFile(configFilePath);
  const projectId =
    getMatched(
      configContent,
      /^#define KERMITE_FIRMWARE_ID "([a-zA-Z0-9]+)"$/m
    ) || "";

  try {
    if (!projectId) {
      throw `KERMITE_FIRMWARE_ID is not defined in ${projectVariationPath}/config.h`;
    }

    if (!projectId?.match(/^[a-zA-Z0-9]{6}$/)) {
      throw `invalid Project ID ${projectId} for ${projectPath}`;
    }
  } catch (error) {
    console.log(error);
    if (AbortOnError) {
      process.exit(1);
    }
  }

  return {
    projectPath,
    projectId,
  };
}

function checkAllProjectIds(_projectInfos: IProjectInfo[]) {
  const projectInfos = uniqueArrayItemsDeep(_projectInfos);
  // console.log({ projectInfos });
  const allProjectIds = projectInfos
    .map((info) => info.projectId)
    .filter((a) => !!a);

  const duplicatedProjectIds = uniqueArrayItems(
    allProjectIds.filter((it, index) => allProjectIds.indexOf(it) !== index)
  );
  if (duplicatedProjectIds.length > 0) {
    duplicatedProjectIds.forEach((badProjectId) => {
      const badProjectPath = projectInfos
        .filter((info) => info.projectId === badProjectId)
        .map((info) => info.projectPath);
      console.log(
        `Project ID conflict. ${badProjectId} is used for ${stringifyArray(
          badProjectPath
        )}`
      );
    });
    if (AbortOnError) {
      process.exit(1);
    }
  }
}

function checkFirmwareIds() {
  const projectVariationPaths = getAllProjectVariationPaths();
  // console.log({ projectVariationPaths });
  const projectInfos = projectVariationPaths.map(loadProjectInfo);
  checkAllProjectIds(projectInfos);
  if (AbortOnError) {
    console.log("ok");
  } else {
    console.log("done");
  }
}

checkFirmwareIds();
