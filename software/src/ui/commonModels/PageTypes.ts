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

export type IPageSpec_ProjectCustomFirmwareCreate = {
  type: 'projectCustomFirmwareCreate';
};

export type IPageSpec_ProjectStandardFirmwareCreate = {
  type: 'projectStandardFirmwareCreate';
};

export type IPageSpec_ProjectLayoutView = {
  type: 'projectLayoutView';
  projectKey: string;
  layoutName: string;
  canEdit: boolean;
};

export type IPageSpec_ProjectPresetView = {
  type: 'projectPresetView';
  projectKey: string;
  presetName: string;
  canEdit: boolean;
};

export type IPageSpec_ProjectStandardFirmwareView = {
  type: 'projectStandardFirmwareView';
  projectKey: string;
  firmwareName: string;
  canEdit: boolean;
};

export type IPageSpec =
  | IPageSpec_ProjectCustomFirmwareCreate
  | IPageSpec_ProjectStandardFirmwareCreate
  | IPageSpec_ProjectLayoutView
  | IPageSpec_ProjectPresetView
  | IPageSpec_ProjectStandardFirmwareView;

export type IPageModelSpec = never;

export type IProjectQuickSetupStep = 'step1' | 'step2' | 'step3';

export type IProfileSetupStep = 'step1' | 'step2' | 'step3';
