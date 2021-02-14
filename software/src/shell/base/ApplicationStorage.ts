import { Rectangle } from 'electron';
import {
  makeObjectPropsOverrideRecursive,
  IGlobalSettings,
  IKeyboardConfig,
  ILayoutEditSource,
} from '~/shared';
import { appEnv } from '~/shell/base';
import { fsExistsSync, fsxReadJsonFile, fsxWriteJsonFile } from '~/shell/funcs';

export interface IWindowPersistState {
  pagePath: string;
  isDevtoolsVisible: boolean;
  placement: {
    main:
      | {
          bounds: Rectangle;
        }
      | undefined;
    widget:
      | {
          projectId: string;
          bounds: Rectangle;
        }
      | undefined;
  };
}

export function makeFallbackWindowPersistState(): IWindowPersistState {
  return {
    pagePath: '/',
    isDevtoolsVisible: false,
    placement: {
      main: undefined,
      widget: undefined,
    },
  };
}
export interface IApplicationPersistData {
  pageState: {
    currentPagePath: string;
  };
  currentProfileName: string | undefined;
  keyboardConfig: IKeyboardConfig;
  layoutEditSource: ILayoutEditSource;
  globalSettings: IGlobalSettings;
  windowState: IWindowPersistState;
}

const defaultPersistData: IApplicationPersistData = {
  pageState: {
    currentPagePath: '/',
  },
  currentProfileName: undefined,
  keyboardConfig: {
    behaviorMode: 'Standalone',
    layoutStandard: 'US',
  },
  layoutEditSource: {
    type: 'NewlyCreated',
  },
  globalSettings: {
    useOnlineResources: true,
    useLocalResouces: false,
    localProjectRootFolderPath: '',
  },
  windowState: makeFallbackWindowPersistState(),
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

  async initializeAsync() {
    if (fsExistsSync(this.configFilePath)) {
      const obj = (await fsxReadJsonFile(
        this.configFilePath,
      )) as IApplicationPersistData;
      // todo: ここで永続データのスキーマをチェックし、データがおかしい場合は読み込まない
      this.data = makeObjectPropsOverrideRecursive(this.data, obj);
    } else {
      console.log('config file not found!');
    }
  }

  async terminateAsync() {
    console.log(`saving persist state`);
    await fsxWriteJsonFile(this.configFilePath, this.data);
  }
}

export const applicationStorage = new ApplicationStorage();
