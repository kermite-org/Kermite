type IProjectProfileEntity = {
  name: string;
  data: any;
};

type IProjectLayoutEntity = {
  name: string;
  data: any;
};

type IProjectFirmwareEntity = {
  name: string;
  data: any;
};

export type IProjectPackage = {
  formatRevision: 'PKG1';
  projectId: string;
  projectName: string;
  variationName: string;
  profiles: IProjectProfileEntity[];
  layouts: IProjectLayoutEntity[];
  firmwares: IProjectFirmwareEntity[];
};
