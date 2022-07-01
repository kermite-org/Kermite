import { IFirmwareTargetDevice } from './domainTypes';

export interface IKrsFirmwareItemSource {
  firmwareId: string;
  firmwareProjectPath: string;
  variationName: string;
  targetDevice: IFirmwareTargetDevice;
  buildResult: 'success' | 'failure';
  firmwareFileName: string;
  metadataFileName: string;
  releaseBuildRevision: number;
  buildTimestamp: string;
}

export interface IKrsFirmwaresSummaryJsonData {
  info: {
    buildStats: {
      numSuccess: number;
      numTotal: number;
    };
    environment: {
      OS: string;
      'arm-none-eabi-gcc': string;
      make: string;
    };
    updateAt: string;
    filesRevision: number;
  };
  firmwares: IKrsFirmwareItemSource[];
}
