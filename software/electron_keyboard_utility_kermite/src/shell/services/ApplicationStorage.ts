import { resolveUserDataFilePath } from '~shell/base/AppEnvironment';
import {
  fsIsFileExists,
  fsxReadJsonFile,
  fsxWriteJsonFile
} from '~funcs/Files';

export class ApplicationStorage {
  readonly configFilePath = resolveUserDataFilePath('data/config.json');
  private data: any = {};
  getItem<T>(key: string): T | undefined {
    return this.data[key];
  }

  setItem<T>(key: string, value: T) {
    this.data[key] = value;
  }

  async initialize(): Promise<void> {
    if (fsIsFileExists(this.configFilePath)) {
      this.data = await fsxReadJsonFile(this.configFilePath);
    } else {
      console.log('config file not found!');
    }
  }

  async terminate(): Promise<void> {
    await fsxWriteJsonFile(this.configFilePath, this.data);
    console.log('config file saved');
  }
}

export const applicationStorage = new ApplicationStorage();
