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
  | '/projectEdit';

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
  variationName: string;
};

export type IPageModalSpec_ProjectCustomFirmwareSetup = {
  type: 'projectCustomFirmwareSetup';
  variationName: string;
};

export type IPageSpec =
  | IPageSpec_ProjectLayoutEdit
  | IPageSpec_ProjectPresetEdit
  | IPageSpec_ProjectStandardFirmwareEdit;

export type IPageModelSpec = IPageModalSpec_ProjectCustomFirmwareSetup;
