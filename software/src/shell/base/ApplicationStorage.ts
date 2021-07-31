import {
  copyObjectPropsRecursive,
  duplicateObjectByJsonStringifyParse,
} from '~/shared';
import { ICheckerEx } from '~/shared/modules/SchemaValidationHelper';
import { appEnv } from '~/shell/base/AppEnv';
import { fsExistsSync, fsxReadJsonFile, fsxWriteJsonFile } from '~/shell/funcs';

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
    const value = this.readItem<T>(key);
    const errors = schemaChecker(value);
    if (errors) {
      console.error(`invalid persist data for ${key}`);
      console.error(JSON.stringify(errors, null, '  '));
      if (fallbackSource instanceof Function) {
        return fallbackSource();
      } else {
        return duplicateObjectByJsonStringifyParse(fallbackSource);
      }
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
    const value = duplicateObjectByJsonStringifyParse(defaultValue);
    if (!errors) {
      copyObjectPropsRecursive(value, loaded);
    }
    return value;
  }

  writeItem<T>(key: string, value: T) {
    this.data[key] = value;
  }

  async initializeAsync() {
    if (!fsExistsSync(this.configFilePath)) {
      console.log('config file not found!');
      return;
    }
    const obj = await fsxReadJsonFile(this.configFilePath);
    this.data = obj;
    this.initialized = true;
  }

  async terminateAsync() {
    console.log(`saving persist state`);
    await fsxWriteJsonFile(this.configFilePath, this.data);
  }
}

export const applicationStorage = new ApplicationStorage();
