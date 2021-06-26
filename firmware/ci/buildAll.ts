import * as fs from "fs";
import glob from "glob";
import path from "path";
import { executeCommand, stringifyArray, uniqueArrayItems } from "./helpers";

process.chdir("..");

const puts = console.log;

const abortOnError = process.argv.includes("--abortOnError");
const failIfError = process.argv.includes("--failIfError");
const buildUpdatedOnly = process.argv.includes("--updatedOnly");

class BuildStepError extends Error {}

function getAllProjectVariationPaths() {
  return glob
    .sync("src/projects/**/rules.mk")
    .map((fpath) => path.dirname(fpath))
    .filter(
      (fpath) =>
        fs.existsSync(path.join(fpath, "config.h")) &&
        fs.existsSync(path.join(path.dirname(fpath), "project.json"))
    )
    .map((fpath) => path.relative("src/projects", fpath))
    .filter((vp) => !vp.startsWith("dev/"));
}

function getUpdatedProjectVariationPaths() {
  const [gitOutput] = executeCommand(
    `git diff origin/variants...HEAD --name-only`
  );
  const dirs = uniqueArrayItems(
    gitOutput.split(/\r?\n/).map((fpath) => path.dirname(fpath))
  );
  return dirs
    .filter((fpath) => fpath.startsWith("firmware/src/projects"))
    .map((fpath) => path.relative("firmware", fpath))
    .filter(
      (fpath) =>
        fs.existsSync(path.join(fpath, "rules.mk")) &&
        fs.existsSync(path.join(fpath, "config.h")) &&
        fs.existsSync(path.join(path.dirname(fpath), "project.json"))
    )
    .map((fpath) => path.relative("src/projects", fpath))
    .filter((vp) => !vp.startsWith("dev/"));
}

function makeFirmwareBuild(projectPath: string, variationName: string) {
  const command = `make ${projectPath}:${variationName}:build IS_RESOURCE_ORIGIN_ONLINE=1`;
  const [_stdout, stderr, status] = executeCommand(command);
  if (status !== 0) {
    throw new BuildStepError(`>${command}\n${stderr}`);
  }
}

function buildFirmware(projectPath: string, variationName: string): boolean {
  const targetName = `${projectPath}--${variationName}`;
  puts(`build ${targetName} ...`);
  // executeCommand(`make ${projectPath}:${variationName}:clean`);
  try {
    makeFirmwareBuild(projectPath, variationName);
    puts(`build ${targetName} ... OK`);
    return true;
  } catch (error) {
    if (error instanceof BuildStepError) {
      puts(error.message);
      if (abortOnError) {
        console.warn(`abort: failed to build ${targetName}`);
        process.exit(1);
      }
      puts(`build ${targetName} ... NG`);
      puts();
      return false;
    } else {
      console.error(error);
      process.exit(1);
    }
  }
}

function buildProjectVariation(projectVariationPath: string) {
  const projectPath = path.dirname(projectVariationPath);
  const variationName = path.basename(projectVariationPath);
  return buildFirmware(projectPath, variationName);
}

function buildProjects() {
  const projectVariationPaths = buildUpdatedOnly
    ? getUpdatedProjectVariationPaths()
    : getAllProjectVariationPaths();
  puts(`target project variations: ${stringifyArray(projectVariationPaths)}`);

  // executeCommand("make clean");
  const results = projectVariationPaths.map(buildProjectVariation);

  const numSuccess = results.filter((result) => !!result).length;
  const numTotal = results.length;
  if (numTotal > 0) {
    puts(`buildStats ${numSuccess}/${numTotal}`);
  }
  if (failIfError && numSuccess !== numTotal) {
    puts(`errors in some projects`);
    process.exit(1);
  }
  puts("done");
}

buildProjects();
