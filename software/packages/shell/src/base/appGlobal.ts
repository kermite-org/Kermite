import { BrowserWindow } from 'electron';

export const appGlobal = new (class {
  mainWindow: BrowserWindow | undefined = undefined;
})();
