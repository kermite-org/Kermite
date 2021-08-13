export type PagePaths =
  | '/'
  | '/editor'
  | '/layouter'
  | '/shapePreview'
  | '/firmwareUpdation'
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

export type IPageSpec = IPageSpec_ProjectLayoutEdit;
