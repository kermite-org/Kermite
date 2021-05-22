import {
  checkHasFields,
  compareObjectByJsonStringifyParse,
  fsxReadTextFile,
  getMatched,
  mapRecord,
} from "./helpers";

process.chdir("..");

const sourceFilePaths = {
  softwareVersions: "../software/src/shared/defs/VersionDefinitions.ts",
  firmwareVersions: "./src/modules/km0/kernel/versionDefinitions.h",
};

interface ISynchronousVersionsSet {
  configStorageFormatRevision: string;
  rawHidProtocolRevision: string;
  profileBinaryFormatRevision: string;
  configParametersRevision: string;
}

const requiredFields: (keyof ISynchronousVersionsSet)[] = [
  "configStorageFormatRevision",
  "rawHidProtocolRevision",
  "profileBinaryFormatRevision",
  "configParametersRevision",
];

function readSoftwareCommonVersions(): ISynchronousVersionsSet {
  const text = fsxReadTextFile(sourceFilePaths.softwareVersions);
  const constantKeys = {
    configStorageFormatRevision: "ConfigStorageFormatRevision",
    rawHidProtocolRevision: "RawHidMessageProtocolRevision",
    profileBinaryFormatRevision: "ProfileBinaryFormatRevision",
    configParametersRevision: "ConfigParametersRevision",
  };
  return mapRecord(
    constantKeys,
    (key) =>
      getMatched(text, new RegExp(`^export const ${key} = (\\d+);$`, "m"))!
  );
}

function readFirmwareCommonVersions(): ISynchronousVersionsSet {
  const text = fsxReadTextFile(sourceFilePaths.firmwareVersions);
  const constantKeys = {
    configStorageFormatRevision: "Kermite_ConfigStorageFormatRevision",
    rawHidProtocolRevision: "Kermite_RawHidMessageProtocolRevision",
    profileBinaryFormatRevision: "Kermite_ProfileBinaryFormatRevision",
    configParametersRevision: "Kermite_ConfigParametersRevision",
  };
  return mapRecord(
    constantKeys,
    (key) => getMatched(text, new RegExp(`^#define ${key} (\\d+)$`, "m"))!
  );
}

function checkVersions() {
  console.log("check version defintions ...");
  const softwareVersions = readSoftwareCommonVersions();
  const firmwareVersions = readFirmwareCommonVersions();
  // console.log({ softwareVersions, firmwareVersions });
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
