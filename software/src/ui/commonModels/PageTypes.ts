export type PagePaths =
  | '/'
  | '/assigner'
  | '/layouter'
  | '/shapePreview'
  | '/firmwareUpdate'
  | '/presetBrowser'
  | '/presetBrowser2'
  | '/settings'
  | '/widget'
  | '/projectSelection'
  | '/home'
  | '/projectResource';

export type IPageSpec_ProjectLayoutEdit = {
  type: 'projectLayoutEdit';
  layoutName: string;
};

export type IPageSpec_ProjectPresetEdit = {
  type: 'projectPresetEdit';
  presetName: string;
};

export type IPageSpec_ProjectStandardFirmwareEdit = {
  type: 'projectStandardFirmwareEdit';
  firmwareName: string;
};

export type IPageModalSpec_ProjectCustomFirmwareSetup = {
  type: 'projectCustomFirmwareSetup';
  firmwareName: string;
};

export type IPageSpec =
  | IPageSpec_ProjectLayoutEdit
  | IPageSpec_ProjectPresetEdit
  | IPageSpec_ProjectStandardFirmwareEdit;

export type IPageModelSpec = IPageModalSpec_ProjectCustomFirmwareSetup;
