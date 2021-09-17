export type PagePaths =
  | '/'
  | '/assigner'
  | '/layoutEditor'
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

export type IPageSpec_ProjectCustomFirmwareEdit = {
  type: 'projectCustomFirmwareSetup';
  firmwareName: string;
};

export type IPageSpec =
  | IPageSpec_ProjectLayoutEdit
  | IPageSpec_ProjectPresetEdit
  | IPageSpec_ProjectStandardFirmwareEdit
  | IPageSpec_ProjectCustomFirmwareEdit;

export type IPageModelSpec = never;
