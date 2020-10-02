import { overwriteObjectProps } from '~funcs/Utils';
import { appUi } from '~ui/core';

export type PageSignature = 'editor' | 'shapePreview' | 'firmwareUpdation';

export interface IUiSettings {
  showTestInputArea: boolean;
  page: PageSignature;
  shapeViewBreedName: string;
  shapeViewShowKeyId: boolean;
  shapeViewShowKeyIndex: boolean;
  shapeViewShowBoundingBox: boolean;
}

const defaultUiSettins: IUiSettings = {
  showTestInputArea: false,
  page: 'editor',
  shapeViewBreedName: '',
  shapeViewShowKeyId: false,
  shapeViewShowKeyIndex: false,
  shapeViewShowBoundingBox: false
};

export interface IUiStatus {
  profileConfigModalVisible: boolean;
}

const defaultUiStatus: IUiStatus = {
  profileConfigModalVisible: false
};

class UiStatusModel {
  readonly settings: IUiSettings = defaultUiSettins;

  readonly status: IUiStatus = defaultUiStatus;

  initialize() {
    const settingsText = localStorage.getItem('uiSettings');
    if (settingsText) {
      const settings = JSON.parse(settingsText);
      overwriteObjectProps(this.settings, settings);
    }
    if (!appUi.isDevelopment || !this.settings.page) {
      this.settings.page = 'editor';
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
