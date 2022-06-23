import { IFirmwareTargetDevice } from '~/shared';

export interface IKrsRemoteProjectResourceInfoSource {
  projectId: string;
  projectPath: string;
  keyboardName: string;
  layoutNames: string[];
  presetNames: string[];
  firmwares: {
    variationName: string;
    targetDevice: IFirmwareTargetDevice;
    binaryFileName: string;
    buildRevision: number;
    buildTimestamp: string;
    romUsage: number;
    ramUsage: number;
  }[];
}

export interface IKrsSummaryJsonData {
  info: {
    buildStats: {
      numSuccess: number;
      numTotal: number;
    };
    environment: {
      OS: string;
      'avr-gcc': string;
      make: string;
    };
    updateAt: string;
    filesRevision: number;
  };
  projects: IKrsRemoteProjectResourceInfoSource[];
}
