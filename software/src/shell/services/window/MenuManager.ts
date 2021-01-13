import { app, Menu } from 'electron';
import { makeListnerPort } from '~/funcs';
import { IMenuManager } from './interfaces';

function makePageMenuItem(
  label: string,
  defaultChecked: boolean,
  handler: () => void,
): Electron.MenuItemConstructorOptions {
  return {
    label,
    type: 'radio',
    checked: defaultChecked,
    click: handler,
  };
}

export class MenuManager implements IMenuManager {
  onMenuChangeCurrentPagePath = makeListnerPort<string>();
  onMenuRequestReload = makeListnerPort<void>();
  onMenuToggleDevtoolVisibility = makeListnerPort<void>();
  onMenuCloseMainWindow = makeListnerPort<void>();
  onMenuRestartApplication = makeListnerPort<void>();

  buildMenu(initailState: {
    allPagePaths: string[];
    currentPagePath: string;
    isDevToolVisible: boolean;
  }): void {
    const { allPagePaths, currentPagePath, isDevToolVisible } = initailState;

    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: app.name,
        submenu: [{ role: 'quit' }],
      },
      {
        label: 'App',
        submenu: [
          {
            label: 'Page',
            submenu: allPagePaths.map((pagePath) =>
              makePageMenuItem(pagePath, pagePath === currentPagePath, () =>
                this.onMenuChangeCurrentPagePath.emit(pagePath),
              ),
            ),
          },
          {
            label: 'Reload Page',
            click: () => this.onMenuRequestReload.emit(),
          },
          {
            label: 'Show DevTool',
            type: 'checkbox',
            checked: isDevToolVisible,
            click: () => this.onMenuToggleDevtoolVisibility.emit(),
          },
          {
            label: 'Restart App',
            click: () => this.onMenuRestartApplication.emit(),
          },
          {
            label: 'Quit',
            click: () => this.onMenuCloseMainWindow.emit(),
          },
        ],
      },
    ];
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
}
