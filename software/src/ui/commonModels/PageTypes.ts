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
  | '/projectResource'
  | '/projectQuickSetup';

export type IPageSpec_ProjectLayoutEdit = {
  type: 'projectLayoutEdit';
  layoutName: string;
};

export type IPageSpec_ProjectPresetEdit = {
  type: 'projectPresetEdit';
  presetName: string;
};

export type IPageSpec_ProjectCustomFirmwareCreate = {
  type: 'projectCustomFirmwareCreate';
};

export type IPageSpec_ProjectStandardFirmwareCreate = {
  type: 'projectStandardFirmwareCreate';
};

export type IPageSpec_ProjectStandardFirmwareEdit = {
  type: 'projectStandardFirmwareEdit';
  firmwareName: string;
};

export type IPageSpec_ProjectQuickSetup = {
  type: 'projectQuickSetup';
};

export type IPageSpec =
  | IPageSpec_ProjectLayoutEdit
  | IPageSpec_ProjectPresetEdit
  | IPageSpec_ProjectCustomFirmwareCreate
  | IPageSpec_ProjectStandardFirmwareCreate
  | IPageSpec_ProjectStandardFirmwareEdit
  | IPageSpec_ProjectQuickSetup;

export type IPageModelSpec = never;
