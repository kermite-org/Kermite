import { duplicateObjectByJsonStringifyParse } from '~/shared';
import { ICheckerEx } from '~/shared/modules/SchemaValidationHelper';
import { appEnv } from '~/shell/base';
import { fsExistsSync, fsxReadJsonFile, fsxWriteJsonFile } from '~/shell/funcs';

class ApplicationStorage {
  private configFilePath = appEnv.resolveUserDataFilePath('data/config.json');
  private data: { [key: string]: any } = {};

  readItem<T>(key: string): T | undefined {
    return this.data[key];
  }

  readItemSafe<T>(
    key: string,
    schemaChecker: ICheckerEx,
    fallbackSource: T | (() => T),
  ): T {
    const value = this.data[key];
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
  }

  async terminateAsync() {
    console.log(`saving persist state`);
    await fsxWriteJsonFile(this.configFilePath, this.data);
  }
}

export const applicationStorage = new ApplicationStorage();
