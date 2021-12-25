export type PagePaths =
  | '/'
  | '/assigner'
  | '/layoutEditor'
  | '/shapePreview'
  | '/firmwareUpdate'
  | '/presetBrowser'
  | '/settings'
  | '/widget'
  | '/projectSelection'
  | '/home'
  | '/projectResource'
  | '/projectQuickSetup/step1'
  | '/projectQuickSetup/step2'
  | '/projectQuickSetup/step3'
  | '/profileSetup/step1'
  | '/profileSetup/step2'
  | '/profileSetup/step3'
  | '/firmwareFlash'
  | '/projectReview';

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

export type IPageSpec =
  | IPageSpec_ProjectLayoutEdit
  | IPageSpec_ProjectPresetEdit
  | IPageSpec_ProjectCustomFirmwareCreate
  | IPageSpec_ProjectStandardFirmwareCreate
  | IPageSpec_ProjectStandardFirmwareEdit;

export type IPageModelSpec = never;

export type IProjectQuickSetupStep = 'step1' | 'step2' | 'step3';

export type IProfileSetupStep = 'step1' | 'step2' | 'step3';
