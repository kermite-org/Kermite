import { IKeyboardConfig, overwriteObjectProps } from '~/shared';
import { appEnv } from '~/shell/base';
import { fsExistsSync, fsxReadJsonFile, fsxWriteJsonFile } from '~/shell/funcs';

export interface IApplicationPersistData {
  pageState: {
    currentPagePath: string;
    isDevToolsVisible: boolean;
  };
  currentProfileName: string | undefined;
  keyboardConfig: IKeyboardConfig;
}

const defaultPersistData: IApplicationPersistData = {
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
class ApplicationStorage {
  private configFilePath = appEnv.resolveUserDataFilePath('data/config.json');
  private data: IApplicationPersistData = defaultPersistData;

  getItem<K extends keyof IApplicationPersistData>(
    key: K,
  ): IApplicationPersistData[K] {
    return this.data[key];
  }

  setItem<K extends keyof IApplicationPersistData>(
    key: K,
    value: IApplicationPersistData[K],
  ) {
    this.data[key] = value;
  }

  async initialize() {
    if (fsExistsSync(this.configFilePath)) {
      const obj = await fsxReadJsonFile(this.configFilePath);
      overwriteObjectProps(this.data, obj);
    } else {
      console.log('config file not found!');
    }
  }

  async terminate() {
    console.log(`saving persist state`);
    await fsxWriteJsonFile(this.configFilePath, this.data);
  }
}

export const applicationStorage = new ApplicationStorage();
