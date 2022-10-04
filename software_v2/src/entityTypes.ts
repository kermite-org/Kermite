type IProjectKeymapEntity = {
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
  keymaps: IProjectKeymapEntity[];
  layouts: IProjectLayoutEntity[];
  firmwares: IProjectFirmwareEntity[];
};
