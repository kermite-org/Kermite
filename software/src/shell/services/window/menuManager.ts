/* eslint-disable @typescript-eslint/no-unused-vars */
// import { app, Menu } from 'electron';
import { makeListenerPort } from '~/shell/funcs';
import { IMenuManager } from './Interfaces';

export class MenuManager implements IMenuManager {
  onMenuRequestReload = makeListenerPort<void>();
  onMenuToggleDevtoolVisibility = makeListenerPort<void>();
  onMenuCloseMainWindow = makeListenerPort<void>();
  onMenuRestartApplication = makeListenerPort<void>();

  buildMenu(): void {
    // const template: Electron.MenuItemConstructorOptions[] = [
    //   {
    //     label: app.name,
    //     submenu: [{ role: 'quit' }],
    //   },
    //   {
    //     label: 'App',
    //     submenu: [
    //       {
    //         label: 'Reload Page',
    //         click: () => this.onMenuRequestReload.emit(),
    //       },
    //       {
    //         label: 'Restart App',
    //         click: () => this.onMenuRestartApplication.emit(),
    //       },
    //       {
    //         label: 'Quit',
    //         click: () => this.onMenuCloseMainWindow.emit(),
    //       },
    //     ],
    //   },
    //   {
    //     label: 'Edit',
    //     submenu: [
    //       { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' } as any,
    //       { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
    //       { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
    //     ],
    //   },
    // ];
    // const menu = Menu.buildFromTemplate(template);
    // Menu.setApplicationMenu(menu);
  }
}
