import { IKeyboardConfig, overwriteObjectProps } from '@kermite/shared';
import Store from 'electron-store';

export interface IApplicationPersistData {
  pageState: {
    currentPagePath: string;
    isDevToolsVisible: boolean;
  };
  currentProfileName: string | undefined;
  keyboardConfig: IKeyboardConfig;
}

class ApplicationStorage {
  private store = new Store();

  _settings: IApplicationPersistData = {
    pageState: {
      currentPagePath: '/',
      isDevToolsVisible: false,
    },
    currentProfileName: undefined,
    keyboardConfig: {
      behaviorMode: 'Standalone',
      layoutStandard: 'US',
    },
  };

  getItem<K extends keyof IApplicationPersistData>(
    key: K,
  ): IApplicationPersistData[K] {
    return this._settings[key];
  }

  setItem<K extends keyof IApplicationPersistData>(
    key: K,
    value: IApplicationPersistData[K],
  ) {
    this._settings[key] = value;
  }

  initialize() {
    const dataText = this.store.get('persistData') as string;
    if (dataText) {
      const obj = JSON.parse(dataText);
      overwriteObjectProps(this._settings, obj);
    }
  }

  terminate() {
    console.log(`saving persist state`);
    const dataText = JSON.stringify(this._settings);
    this.store.set('persistData', dataText);
  }
}
export const applicationStorage = new ApplicationStorage();
