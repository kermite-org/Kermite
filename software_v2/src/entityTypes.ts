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

type ILocalProject = {
  projectName: string;
  profiles: IProjectProfileEntity[];
  layouts: IProjectLayoutEntity[];
  firmwares: IProjectFirmwareEntity[];
};
