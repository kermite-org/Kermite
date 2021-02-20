import { Rectangle } from 'electron';
import { IGlobalSettings, IKeyboardConfig, ILayoutEditSource } from '~/shared';
import { appEnv } from '~/shell/base';
import { fsExistsSync, fsxReadJsonFile, fsxWriteJsonFile } from '~/shell/funcs';
import {
  vBoolean,
  vNumber,
  vObject,
  vSchemaOneOf,
  vString,
  vValueEquals,
  vValueOneOf,
} from '~/shell/loaders/SchemaValidationHelper';

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

const rectangleSchema = vObject({
  x: vNumber(),
  y: vNumber(),
  width: vNumber(),
  height: vNumber(),
});

export const applicationPersistDataSchemaChecker = vObject({
  pageState: vObject({
    currentPagePath: vString(),
  }),
  currentProfileName: vString(),
  keyboardConfig: vObject({
    behaviorMode: vValueOneOf(['Standalone', 'SideBrain']),
    layoutStandard: vValueOneOf(['US', 'JIS']),
  }),
  layoutEditSource: vSchemaOneOf([
    vObject({
      type: vValueEquals('NewlyCreated'),
    }),
    vObject({
      type: vValueEquals('CurrentProfile'),
    }),
    vObject({
      type: vValueEquals('File'),
      filePath: vString(),
    }),
    vObject({
      type: vValueEquals('ProjectLayout'),
      projectId: vString(),
      layoutName: vString(),
    }),
  ]),
  globalSettings: vObject({
    useOnlineResources: vBoolean(),
    useLocalResouces: vBoolean(),
    localProjectRootFolderPath: vString(),
  }),
  windowState: vObject({
    pagePath: vString(),
    isDevtoolsVisible: vBoolean(),
    placement: vObject({
      main: vObject({
        bounds: rectangleSchema,
      }).optional,
      widget: vObject({
        projectId: vString(),
        bounds: rectangleSchema,
      }).optional,
    }),
  }),
});
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

      const errors = applicationPersistDataSchemaChecker(obj);
      if (errors) {
        console.error(`application persist data schema error`);
        console.log(JSON.stringify(errors, null, '  '));
      } else {
        this.data = obj;
      }
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
