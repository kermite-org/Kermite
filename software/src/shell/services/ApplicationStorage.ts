import {
  fsIsFileExists,
  fsxReadJsonFile,
  fsxWriteJsonFile
} from '~funcs/Files';
import { appEnv } from '~shell/base/AppEnvironment';

// 永続化状態を<UserDataDir>/data/config.jsonに保存・復元
export class ApplicationStorage {
  readonly configFilePath = appEnv.resolveUserDataFilePath('data/config.json');
  private data: any = {};
  getItem<T>(key: string): T | undefined {
    return this.data[key];
  }

  setItem<T>(key: string, value: T) {
    this.data[key] = value;
  }

  async initializeAsync(): Promise<void> {
    if (fsIsFileExists(this.configFilePath)) {
      this.data = await fsxReadJsonFile(this.configFilePath);
    } else {
      console.log('config file not found!');
    }
  }

  async terminateAsync(): Promise<void> {
    await fsxWriteJsonFile(this.configFilePath, this.data);
    console.log('config file saved');
  }
}

export const applicationStorage = new ApplicationStorage();
