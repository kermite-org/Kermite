export type PagePaths =
  | '/'
  | '/editor'
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

export type IPageSpec_ProjectFirmwareEdit = {
  type: 'projectFirmwareEdit';
  firmwareName: string;
};

export type IPageSpec =
  | IPageSpec_ProjectLayoutEdit
  | IPageSpec_ProjectPresetEdit
  | IPageSpec_ProjectFirmwareEdit;
