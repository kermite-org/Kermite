import Store from 'electron-store';
import { IAppPersistData } from '~/base/appInterfaces';

export class AppStatePersistence {
  private store = new Store();

  load(): IAppPersistData | undefined {
    const dataText = this.store.get('persistData') as string;
    if (dataText) {
      return JSON.parse(dataText);
    }
  }

  save(persistData: IAppPersistData) {
    const dataText = JSON.stringify(persistData);
    this.store.set('persistData', dataText);
  }
}
