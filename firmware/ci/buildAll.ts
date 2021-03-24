import * as fs from "fs";
import glob from "glob";
import path from "path";
import { executeCommand, stringifyArray } from "./helpers";

process.chdir("..");

const puts = console.log;

const AbortOnError = process.argv.includes("--abortOnError");

function getAllProjectVariationPaths() {
  return glob
    .sync("src/projects/**/rules.mk")
    .map((fpath) => path.dirname(fpath))
    .filter(
      (fpath) =>
        fs.existsSync(path.join(fpath, "config.h")) &&
        fs.existsSync(path.join(path.dirname(fpath), "project.json"))
    )
    .map((fpath) => path.relative("src/projects", fpath));
}

function makeFirmwareBuild(projectPath: string, variationName: string) {
  const command = `make ${projectPath}:${variationName}:build IS_RESOURCE_ORIGIN_ONLINE=1`;
  const [_stdout, stderr, status] = executeCommand(command);
  if (status !== 0) {
    throw new Error(`>${command}\n${stderr}`);
  }
}

function checkFirmwareBinarySize(projectPath: string, variationName: string) {
  const sizeCommand = `make ${projectPath}:${variationName}:size`;
  const [sizeOutputText] = executeCommand(sizeCommand);

  let usageProg = -1;
  let usageData = -1;
  if (sizeOutputText.includes("worker/atmega32u4.mk")) {
    usageProg = parseFloat(
      sizeOutputText.match(/^Program.*\(([\d.]+)% Full\)/m)![1]
    );
    usageData = parseFloat(
      sizeOutputText.match(/^Data.*\(([\d.]+)% Full\)/m)![1]
    );
  } else if (sizeOutputText.includes("worker/rp2040.mk")) {
    usageProg = parseFloat(sizeOutputText.match(/FLASH:.*\s([\d.]+)%/m)![1]);
    usageData = parseFloat(sizeOutputText.match(/RAM:.*\s([\d.]+)%/m)![1]);
  } else {
    throw new Error("unexpected size command output");
  }
  if (
    !(0 < usageProg && usageProg < 100.0 && 0 < usageData && usageData < 100.0)
  ) {
    throw new Error(
      `firmware footprint overrun (FLASH: ${usageProg}%, RAM: ${usageData}%)`
    );
  }
}

function buildFirmware(projectPath: string, variationName: string): boolean {
  const targetName = `${projectPath}--${variationName}`;
  puts(`build ${targetName} ...`);
  // executeCommand(`make ${projectPath}:${variationName}:clean`);
  try {
    makeFirmwareBuild(projectPath, variationName);
    checkFirmwareBinarySize(projectPath, variationName);
    puts(`build ${targetName} ... OK`);
    return true;
  } catch (error) {
    puts(error.message);
    if (AbortOnError) {
      console.warn(`abort: failed to build ${targetName}`);
      process.exit(1);
    }
    puts(`build ${targetName} ... NG`);
    puts();
    return false;
  }
}

function buildProjectVariation(projectVariationPath: string) {
  const projectPath = path.dirname(projectVariationPath);
  const variationName = path.basename(projectVariationPath);
  return buildFirmware(projectPath, variationName);
}

function buildProjects() {
  const projectVariationPaths = getAllProjectVariationPaths();
  puts(`target project variations: ${stringifyArray(projectVariationPaths)}`);

  // executeCommand("make clean");
  const results = projectVariationPaths.map(buildProjectVariation);

  const numSuccess = results.filter((result) => !!result).length;
  const numTotal = results.length;
  if (numTotal > 0) {
    puts(`buildStats ${numSuccess}/${numTotal}`);
  }
  puts("done");
}

buildProjects();
