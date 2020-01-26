import { ipcMain } from 'electron';
import { IEditModel } from '~contract/data';
import {
  IBackendAgent,
  IpcPacket,
  IProfileManagerCommand,
  IWindowManagerCommand
} from '~contract/ipc';
import { xpcMain } from '~funcs/xpc/xpcMain';
import { appWindowManager } from '~shell/AppWindowManager';
import { appGlobal } from './appGlobal';

export class IpcBridge {
  async initialize() {
    ipcMain.on('message', (event, packet: IpcPacket) => {
      if (packet.debugMessage) {
        console.log(packet.debugMessage);
        event.returnValue = true;
      }

      if (packet.reloadApplication) {
        appGlobal.eventBus.emit('reloadApplicationRequested', true);
      }

      if (packet.reserveSaveProfileTask) {
        appGlobal.profileManager.reserveSaveProfileTask(
          packet.reserveSaveProfileTask
        );
        event.returnValue = true;
      }

      if (packet.closeWindow) {
        appWindowManager.closeMainWindow();
        event.returnValue = true;
      }
      if (packet.minimizeWindow) {
        appWindowManager.minimizeMainWindow();
        event.returnValue = true;
      }
      if (packet.maximizeWindow) {
        appWindowManager.maximizeMainWindow();
        event.returnValue = true;
      }

      if (packet.widgetModeChanged) {
        appWindowManager.adjustWindowSize(packet.widgetModeChanged);
        event.returnValue = true;
      }
    });

    ipcMain.on(
      'profileManagerCommands',
      (event, commands: IProfileManagerCommand[]) => {
        appGlobal.profileManager.executeCommands(commands);
      }
    );

    ipcMain.on('windowManagerCommand', (event, cmd: IWindowManagerCommand) => {
      if (cmd.widgetModeChanged) {
        appWindowManager.adjustWindowSize(cmd.widgetModeChanged.isWidgetMode);
      }
    });

    const backendAgent: IBackendAgent = {
      keyEvents: {
        subscribe(listener) {
          appGlobal.deviceService.subscribe(listener);
        },
        unsubscribe(listener) {
          appGlobal.deviceService.unsubscribe(listener);
        }
      },
      profileStatusEvents: {
        subscribe(listener) {
          appGlobal.profileManager.subscribeStatus(listener);
        },
        unsubscribe(listener) {
          appGlobal.profileManager.unsubscribeStatus(listener);
        }
      }
    };
    xpcMain.supplyBackendAgent('default', backendAgent);
  }

  async terminate() {}
}
