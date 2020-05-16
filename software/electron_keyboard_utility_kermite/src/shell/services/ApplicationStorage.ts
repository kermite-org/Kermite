import { Files } from '~funcs/Files';
import { resolveFilePath } from '~shell/AppConfig';

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
    if (Files.isExists(this.configFilePath)) {
      this.data = await Files.readJson(this.configFilePath);
    } else {
      // eslint-disable-next-line no-console
      console.log('config file not found!');
    }
  }

  async terminate(): Promise<void> {
    await Files.writeJson(this.configFilePath, this.data);
    // eslint-disable-next-line no-console
    console.log('config file saved');
  }
}
