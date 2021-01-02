import { app, Menu } from 'electron';
import { makeListnerPort } from '~/funcs';
import {
  IMenuCallbackEvent,
  IMenuManager,
} from '~/windowServices/serviceInterfaces';

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
  handleEvents = makeListnerPort<IMenuCallbackEvent>();

  private emitEvent(event: IMenuCallbackEvent) {
    this.handleEvents.emit(event);
  }

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
                this.emitEvent({ changeCurrentPagePath: { pagePath } }),
              ),
            ),
          },
          {
            label: 'Reload Page',
            click: () => this.emitEvent({ requestReload: true }),
          },
          {
            label: 'Show DevTool',
            type: 'checkbox',
            checked: isDevToolVisible,
            click: () => this.emitEvent({ toggleDevtoolVisibility: true }),
          },
          {
            label: 'Quit',
            click: () => this.emitEvent({ closeMainWindow: true }),
          },
          // {
          //   label: 'Restart Application',
          //   click: () => {
          //     app.relaunch();
          //     app.exit();
          //   },
          // },
        ],
      },
    ];
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
}
