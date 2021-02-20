import {
  vBoolean,
  vNumber,
  vObject,
} from '~/shared/modules/SchemaValidationHelper';

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
  showLayersDynamic: boolean;
  showLayerDefaultAssign: boolean;
  siteDpiScale: number;
  showGlobalHint: boolean;
}

const defaultUiSettings: IUiSettings = {
  showTestInputArea: false,
  showLayersDynamic: false,
  showLayerDefaultAssign: false,
  siteDpiScale: 1.0,
  showGlobalHint: true,
};

export const uiSettingsDataSchemaChecker = vObject({
  showTestInputArea: vBoolean(),
  showLayersDynamic: vBoolean(),
  showLayerDefaultAssign: vBoolean(),
  siteDpiScale: vNumber(),
  showGlobalHint: vBoolean(),
});

export interface IUiStatus {
  profileConfigModalVisible: boolean;
}

const defaultUiStatus: IUiStatus = {
  profileConfigModalVisible: false,
};

export class UiStatusModel {
  settings: IUiSettings = defaultUiSettings;

  readonly status: IUiStatus = defaultUiStatus;

  initialize() {
    const settingsText = localStorage.getItem('uiSettings');
    if (settingsText) {
      const obj = JSON.parse(settingsText);
      const errors = uiSettingsDataSchemaChecker(obj);
      if (errors) {
        console.error(`ui settings data schema error`);
        console.log(JSON.stringify(errors, null, '  '));
      } else {
        this.settings = obj;
      }
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
