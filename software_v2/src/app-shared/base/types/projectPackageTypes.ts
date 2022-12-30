import { IPersistKeyboardDesign } from './keyboardDesign';
import { IPersistProfileData } from './profileData';
import { IStandardFirmwareEntityData } from './standardFirmware';

type IProjectProfileEntity = {
  name: string;
  data: IPersistProfileData;
};

type IProjectLayoutEntity = {
  name: string;
  data: IPersistKeyboardDesign;
};

type IProjectFirmwareEntity = {
  name: string;
  data: IStandardFirmwareEntityData;
};

export type IProjectPackageFileContent = {
  formatRevision: 'PKG1';
  projectId: string;
  projectName: string;
  variationName: string;
  profiles: IProjectProfileEntity[];
  layouts: IProjectLayoutEntity[];
  firmwares: IProjectFirmwareEntity[];
};

export type IProjectPackage = IProjectPackageFileContent;
