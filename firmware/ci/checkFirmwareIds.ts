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
} from "./helpers";

process.chdir("..");

let hasError = false;

function getAllFirmwarePaths() {
  return globSync("src/projects/**/rules.mk")
    .map((filePath) => pathDirname(filePath))
    .filter((filePath) => fsExistsSync(pathJoin(filePath, "config.h")))
    .map((filePath) => pathRelative("src/projects", filePath))
    .filter((vp) => !(vp.startsWith("dev/") || vp.startsWith("study/")));
}

interface IFirmwareInfo {
  firmwarePath: string;
  firmwareId: string;
}

function loadFirmwareInfo(firmwarePath: string): IFirmwareInfo {
  const configFilePath = `./src/projects/${firmwarePath}/config.h`;

  const configContent = fsxReadTextFile(configFilePath);
  const firmwareId =
    getMatched(
      configContent,
      /^#define KERMITE_FIRMWARE_ID "([a-zA-Z0-9]+)"$/m
    ) || "";

  try {
    if (!firmwareId) {
      throw `KERMITE_FIRMWARE_ID is not defined in ${firmwarePath}/config.h`;
    }

    if (!firmwareId?.match(/^[a-zA-Z0-9]{6}$/)) {
      throw `invalid Project ID ${firmwareId} for ${firmwarePath}`;
    }
  } catch (error) {
    console.log(error);
    hasError = true;
  }

  return {
    firmwarePath,
    firmwareId,
  };
}

function checkAllFirmwareIds(firmwareInfos: IFirmwareInfo[]) {
  const allFirmwareIds = firmwareInfos
    .map((info) => info.firmwareId)
    .filter((a) => !!a);

  const duplicatedFirmwareIds = uniqueArrayItems(
    allFirmwareIds.filter((it, index) => allFirmwareIds.indexOf(it) !== index)
  );

  if (duplicatedFirmwareIds.length > 0) {
    duplicatedFirmwareIds.forEach((badFirmwareId) => {
      const badProjectPath = firmwareInfos
        .filter((info) => info.firmwareId === badFirmwareId)
        .map((info) => info.firmwarePath);
      console.log(
        `Firmware ID conflict. ${badFirmwareId} is used for ${stringifyArray(
          badProjectPath
        )}`
      );
    });
    hasError = true;
  }
}

function checkFirmwareIds() {
  const firmwarePaths = getAllFirmwarePaths();
  // console.log({ firmwarePaths });
  const firmwareInfos = firmwarePaths.map(loadFirmwareInfo);
  // console.log({ firmwareInfos });
  checkAllFirmwareIds(firmwareInfos);
  if (!hasError) {
    console.log("ok");
  } else {
    process.exit(1);
  }
}

checkFirmwareIds();
