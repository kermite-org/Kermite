import { glob } from "glob";
import * as path from "path";
import * as fs from "fs";
import { fsxReadJsonFile, fsxReadTextFile } from "./osHelpers";
import { getMatched, stringifyArray, uniqueArrayItems } from "./helpers";

process.chdir("..");

const puts = console.log;

const failureStatusIfError = process.argv.includes("--failureStatusIfError");

function getAllProjectPaths() {
  return glob
    .sync("src/projects/**/rules.mk")
    .map((fpath) => path.dirname(fpath))
    .filter((fpath) =>
      ["layout.json", "config.h"].every((fileName) =>
        fs.existsSync(path.join(fpath, fileName))
      )
    )
    .map((fpath) => path.relative("src/projects", fpath));
}

interface IProjectInfo {
  projectPath: string;
  projectId: string;
}

const errors: string[] = [];

function putError(text: string) {
  console.log(text);
  errors.push(text);
}

function loadProjectInfo(projectPath: string): IProjectInfo {
  const layoutFilePath = `./src/projects/${projectPath}/layout.json`;
  const configFilePath = `./src/projects/${projectPath}/config.h`;
  const layoutObj = fsxReadJsonFile(layoutFilePath);
  const projectId = layoutObj.projectId as string;

  const configContent = fsxReadTextFile(configFilePath);
  const configProjectId = getMatched(
    configContent,
    /^#define PROJECT_ID "([a-zA-Z0-9]+)"$/m
  );

  if (!projectId) {
    putError(`projectId is not defined in ${projectPath}/layout.json`);
  }

  if (!configProjectId) {
    putError(`PROJECT_ID is not defined in ${projectPath}/config.h`);
  }

  const projectIdValid = projectId?.match(/^[a-zA-Z0-9]{8}$/);
  if (projectId && !projectIdValid) {
    putError(`invalid Project ID ${projectId} for ${projectPath}`);
  }

  if (projectIdValid && configProjectId && projectId !== configProjectId) {
    putError(
      `inconsistent Project IDs in ${projectPath}/config.h and ${projectPath}/layout.json`
    );
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
      putError(
        `Project ID confliction. ${badProjectId} is used for ${stringifyArray(
          badProjectPath
        )}`
      );
    });
  }
}

function checkProjectIds() {
  const projectPaths = getAllProjectPaths();
  const projectInfos = projectPaths.map(loadProjectInfo);
  checkAllProjectIds(projectInfos);
  if (failureStatusIfError && errors.length > 0) {
    process.exit(1);
  }
  if (errors.length === 0) {
    puts("ok");
  }
}

checkProjectIds();
