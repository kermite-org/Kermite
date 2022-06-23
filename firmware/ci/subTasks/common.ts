export interface IFirmwareMetadataJson {
  firmwareId: string;
  buildResult: "success" | "failure";
  releaseBuildRevision: number;
  buildTimestamp: string;
  storageFormatRevision: number;
  messageProtocolRevision: number;
  profileBinaryFormatRevision: number;
  configParametersRevision: number;
  flashUsage: number;
  ramUsage: number;
  firmwareFileSize: number;
  firmwareBinaryFileMD5: string;
  variationName: string;
  // targetDevice: "atmega32u4" | "rp2040";
  targetDevice: "rp2040";
  firmwareFileName: string;
}
