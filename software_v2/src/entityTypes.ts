type IProjectProfileEntity = {
  name: string;
};

type IProjectLayoutEntity = {
  name: string;
};

type IProjectFirmwareEntity = {
  name: string;
};

type ILocalProject = {
  projectName: string;
  profiles: IProjectProfileEntity[];
  layouts: IProjectLayoutEntity[];
  firmwares: IProjectFirmwareEntity[];
};
