import { copyObjectProps } from '~/shared';

export type PagePaths =
  | '/'
  | '/editor'
  | '/layouter'
  | '/shapePreview'
  | '/firmwareUpdation'
  | '/presetBrowser'
  | '/heatmap'
  | '/settings'
  | '/widget';

export interface IUiSettings {
  showTestInputArea: boolean;
  shapeViewProjectSig: string;
  shapeViewLayoutName: string;
  shapeViewShowKeyId: boolean;
  shapeViewShowKeyIndex: boolean;
  shapeViewShowBoundingBox: boolean;
  showLayersDynamic: boolean;
  showLayerDefaultAssign: boolean;
}

const defaultUiSettings: IUiSettings = {
  showTestInputArea: false,
  shapeViewProjectSig: '',
  shapeViewLayoutName: '',
  shapeViewShowKeyId: false,
  shapeViewShowKeyIndex: false,
  shapeViewShowBoundingBox: false,
  showLayersDynamic: false,
  showLayerDefaultAssign: false,
};

export interface IUiStatus {
  profileConfigModalVisible: boolean;
}

const defaultUiStatus: IUiStatus = {
  profileConfigModalVisible: false,
};

export class UiStatusModel {
  readonly settings: IUiSettings = defaultUiSettings;

  readonly status: IUiStatus = defaultUiStatus;

  initialize() {
    const settingsText = localStorage.getItem('uiSettings');
    if (settingsText) {
      const settings = JSON.parse(settingsText);
      copyObjectProps(this.settings, settings);
    }
  }

  save() {
    const settingsText = JSON.stringify(this.settings);
    localStorage.setItem('uiSettings', settingsText);
  }

  finalize() {
    this.save();
  }
}

export const uiStatusModel = new UiStatusModel();
