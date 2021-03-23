import {
  fsExistsSync,
  fsxReadJsonFile,
  fsxReadTextFile,
  getMatched,
  globSync,
  pathDirname,
  pathJoin,
  pathRelative,
  stringifyArray,
  uniqueArrayItems,
} from "./helpers";

process.chdir("..");

const AbortOnError = process.argv.includes("--abortOnError");

function getAllProjectPaths() {
  return globSync("src/projects/**/rules.mk")
    .map((fpath) => pathDirname(fpath))
    .filter((fpath) =>
      ["project.json", "config.h"].every((fileName) =>
        fsExistsSync(pathJoin(fpath, fileName))
      )
    )
    .map((fpath) => pathRelative("src/projects", fpath));
}

interface IProjectInfo {
  projectPath: string;
  projectId: string;
}

function loadProjectInfo(projectPath: string): IProjectInfo {
  const projectFilePath = `./src/projects/${projectPath}/project.json`;
  const configFilePath = `./src/projects/${projectPath}/config.h`;
  const projectObj = fsxReadJsonFile(projectFilePath);
  const projectId = projectObj.projectId as string;

  const configContent = fsxReadTextFile(configFilePath);
  const configProjectId = getMatched(
    configContent,
    /^#define PROJECT_ID "([a-zA-Z0-9]+)"$/m
  );

  try {
    if (!projectId) {
      throw `projectId is not defined in ${projectPath}/project.json`;
    }

    if (!configProjectId) {
      throw `PROJECT_ID is not defined in ${projectPath}/config.h`;
    }

    if (!projectId?.match(/^[a-zA-Z0-9]{8}$/)) {
      throw `invalid Project ID ${projectId} for ${projectPath}`;
    }

    if (projectId !== configProjectId) {
      throw `inconsistent Project IDs in ${projectPath}/config.h and ${projectPath}/project.json`;
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

function checkAllProjectIds(projectInfos: IProjectInfo[]) {
  const allProjectIds = projectInfos
    .map((info) => info.projectId)
    .filter((a) => !!a);
  const duprecatedProjectIds = uniqueArrayItems(
    allProjectIds.filter((it, index) => allProjectIds.indexOf(it) !== index)
  );
  if (duprecatedProjectIds.length > 0) {
    duprecatedProjectIds.forEach((badProjectId) => {
      const badProjectPath = projectInfos
        .filter((info) => info.projectId === badProjectId)
        .map((info) => info.projectPath);
      console.log(
        `Project ID confliction. ${badProjectId} is used for ${stringifyArray(
          badProjectPath
        )}`
      );
    });
    if (AbortOnError) {
      process.exit(1);
    }
  }
}

function checkProjectIds() {
  const projectPaths = getAllProjectPaths();
  const projectInfos = projectPaths.map(loadProjectInfo);
  checkAllProjectIds(projectInfos);
  if (AbortOnError) {
    console.log("ok");
  } else {
    console.log("done");
  }
}

checkProjectIds();
