import {
  checkHasFields,
  compareObjectByJsonStringifyParse,
  fsxReadTextFile,
  getMatched,
} from "./helpers";

process.chdir("..");

const sourceFilePaths = {
  softwareVersions: "../software/src/defs/Versions.ts",
  firmwareVersions: "./src/modules/versions.h",
};

interface ISynchronousVersionsSet {
  configStorageFormatRevision: string;
  rawHidProtocolRevision: string;
}

const requiredFields: (keyof ISynchronousVersionsSet)[] = [
  "configStorageFormatRevision",
  "rawHidProtocolRevision",
];

function readSoftwareCommonVersions(): ISynchronousVersionsSet {
  const text = fsxReadTextFile(sourceFilePaths.softwareVersions);
  return {
    configStorageFormatRevision: getMatched(
      text,
      /^export const ConfigStorageFormatRevision = (\d+);$/m
    )!,
    rawHidProtocolRevision: getMatched(
      text,
      /^export const RawHidMessageProtocolRevision = (\d+);$/m
    )!,
  };
}

function readFirmwareCommonVersions(): ISynchronousVersionsSet {
  const text = fsxReadTextFile(sourceFilePaths.firmwareVersions);
  return {
    configStorageFormatRevision: getMatched(
      text,
      /^#define CONFIG_STORAGE_FORMAT_REVISION (\d+)$/m
    )!,
    rawHidProtocolRevision: getMatched(
      text,
      /^#define RAWHID_MESSAGE_PROTOCOL_REVISION (\d+)$/m
    )!,
  };
}

function checkVersions() {
  console.log("check version defintions ...");
  const softwareVersions = readSoftwareCommonVersions();
  const firmwareVersions = readFirmwareCommonVersions();
  const vSoftOk = checkHasFields(softwareVersions, requiredFields);
  const vFirmOk = checkHasFields(firmwareVersions, requiredFields);
  const equivalent = compareObjectByJsonStringifyParse(
    softwareVersions,
    firmwareVersions
  );
  const valid = vSoftOk && vFirmOk && equivalent;
  if (!valid) {
    console.error("incompatibe version definitions");
    console.error({ softwareVersions, firmwareVersions });
    process.exit(1);
  }
  console.log("check version defintions ... ok");
}

checkVersions();
