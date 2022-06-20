import {
  cloneObject,
  duplicateObjectByJsonStringifyParse,
  ICheckerEx,
} from '~/shared';
import { appEnv } from '~/shell/base/AppEnv';
import {
  fsExistsSync,
  fsxEnsureFolderExists,
  fsxReadJsonFile,
  fsxWriteJsonFile,
  pathDirname,
} from '~/shell/funcs';

class ApplicationStorage {
  private configFilePath = appEnv.resolveUserDataFilePath('data/config.json');
  private data: { [key: string]: any } = {};

  private initialized: boolean = false;

  readItem<T>(key: string): T | undefined {
    if (!this.initialized) {
      console.warn('[WARN] accessed ApplicationStorage before initialization');
    }
    return this.data[key];
  }

  // 値を読み込み、スキーマがおかしい場合はデフォルト値に置き換える
  readItemSafe<T>(
    key: string,
    schemaChecker: ICheckerEx,
    fallbackSource: T | (() => T),
  ): T {
    const returnFallbackValue = () => {
      if (fallbackSource instanceof Function) {
        return fallbackSource();
      } else {
        return duplicateObjectByJsonStringifyParse(fallbackSource);
      }
    };
    const value = this.readItem<T>(key);
    if (value === undefined) {
      return returnFallbackValue();
    }

    const errors = schemaChecker(value);
    if (errors) {
      console.error(`invalid persist data for ${key}`);
      console.error(JSON.stringify(errors, null, '  '));
      return returnFallbackValue();
    }
    return value!;
  }

  // 値を読み込みんでスキーマをチェックし、デフォルトの値をベースに各フィールドを読み込んだ値で上書きする
  readItemBasedOnDefault<T>(
    key: string,
    schemaChecker: ICheckerEx,
    defaultValue: T,
  ): T {
    const loaded = this.readItem(key);
    const errors = schemaChecker(loaded);
    if (!errors) {
      return cloneObject({ ...defaultValue, ...(loaded as any) });
    } else {
      return defaultValue;
    }
  }

  writeItem<T>(key: string, value: T) {
    this.data[key] = value;
  }

  initialize() {
    if (!fsExistsSync(this.configFilePath)) {
      console.log('config file not found!, create it');
      fsxEnsureFolderExists(pathDirname(this.configFilePath));
      fsxWriteJsonFile(this.configFilePath, {});
    }
    const obj = fsxReadJsonFile(this.configFilePath);
    this.data = obj;
    this.initialized = true;
  }

  terminate() {
    console.log(`saving persist state`);
    fsxWriteJsonFile(this.configFilePath, this.data);
  }
}

export const applicationStorage = new ApplicationStorage();
