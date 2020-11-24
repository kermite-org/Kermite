import * as fs from "fs";
import glob from "glob";
import path from "path";
import { stringifyArray, uniqueArrayItems } from "./helpers";
import { executeCommand } from "./osHelpers";

process.chdir("..");

const puts = console.log;

const FirmwareProjectsDir = "firmware/src/projects";
const BuildUpdatedOnly = process.argv.includes("--updatedOnly");
const AbortOnError = process.argv.includes("--abortOnError");

function getAllProjectPaths() {
  return glob
    .sync("src/projects/**/rules.mk")
    .map((fpath) => path.dirname(fpath))
    .filter((fpath) => fs.existsSync(path.join(fpath, "layout.json")))
    .map((fpath) => path.relative("src/projects", fpath));
}

function getUpdatedProjectPaths() {
  const [gitOutput] = executeCommand(`git diff --name-only HEAD~`);
  const dirs = uniqueArrayItems(
    gitOutput.split(/\r?\n/).map((fpath) => path.dirname(fpath))
  );
  return dirs
    .filter((fpath) => fpath.startsWith(FirmwareProjectsDir))
    .map((fpath) => path.relative(FirmwareProjectsDir, fpath))
    .filter((projectPath) =>
      ["rules.mk", "layout.json"].every((fileName) =>
        fs.existsSync(path.join("src/projects", projectPath, fileName))
      )
    );
}

function makeProjectBuild(projectPath: string) {
  const command = `make ${projectPath}:build`;
  const [_stdout, stderr, status] = executeCommand(command);
  if (status !== 0) {
    throw new Error(`>${command}\n${stderr}`);
  }
}

function checkBinarySize(projectPath: string) {
  const sizeCommand = `make ${projectPath}:size`;
  const [sizeOutputLines] = executeCommand(sizeCommand);
  const usageProg = parseFloat(
    sizeOutputLines.match(/^Program.*\(([\d.]+)% Full\)/m)![1]
  );
  const usageData = parseFloat(
    sizeOutputLines.match(/^Data.*\(([\d.]+)% Full\)/m)![1]
  );
  if (!(usageProg < 100.0 && usageData < 100.0)) {
    throw new Error(
      `firmware footprint overrun (FLASH: ${usageProg}, RAM: ${usageData})`
    );
  }
}

function buildProject(projectPath: string): boolean {
  puts(`build ${projectPath} ...`);
  executeCommand(`make ${projectPath}:purge`);
  try {
    makeProjectBuild(projectPath);
    checkBinarySize(projectPath);
    puts(`build ${projectPath} ... OK`);
    return true;
  } catch (error) {
    puts(error.message);
    if (AbortOnError) {
      console.warn(`abort: failed to build ${projectPath}`);
      process.exit(1);
    }
    puts(`build ${projectPath} ... NG`);
    puts();
    return false;
  }
}

function buildProjects() {
  const projectPaths = BuildUpdatedOnly
    ? getUpdatedProjectPaths()
    : getAllProjectPaths();
  puts(`target projects: ${stringifyArray(projectPaths)}`);

  executeCommand("make clean");
  const results = projectPaths.map(buildProject);

  const numSuccess = results.filter((result) => result).length;
  const numTotal = results.length;
  if (numTotal > 0) {
    puts(`buildStats ${numSuccess}/${numTotal}`);
  }
  puts("done");
}

buildProjects();
