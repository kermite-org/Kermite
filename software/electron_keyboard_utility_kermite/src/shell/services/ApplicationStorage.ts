import { resolveFilePath } from '~shell/AppConfig';
import {
  fsIsFileExists,
  fsxReadJsonFile,
  fsxWriteJsonFile
} from '~funcs/Files';

export class ApplicationStorage {
  readonly configFilePath = resolveFilePath('data/config.json');
  private data: any = {};
  getItem(key: string): any {
    return this.data[key];
  }

  setItem(key: string, value: any) {
    this.data[key] = value;
  }

  async initialize(): Promise<void> {
    if (fsIsFileExists(this.configFilePath)) {
      this.data = await fsxReadJsonFile(this.configFilePath);
    } else {
      // eslint-disable-next-line no-console
      console.log('config file not found!');
    }
  }

  async terminate(): Promise<void> {
    await fsxWriteJsonFile(this.configFilePath, this.data);
    // eslint-disable-next-line no-console
    console.log('config file saved');
  }
}
