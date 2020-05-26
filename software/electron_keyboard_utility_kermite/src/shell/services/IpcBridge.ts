import { ipcMain } from 'electron';
import { IBackendAgent, IpcPacket, IProfileManagerCommand } from '~defs/ipc';
import { xpcMain } from '~funcs/xpc/xpcMain';
import { appWindowManager } from '~shell/AppWindowManager';
import { appGlobal } from './appGlobal';
import { KeyMappingEmitter } from './EmitDataBuilder/KeyMappingEmitter';

export class IpcBridge {
  async initialize() {
    ipcMain.on('message', (event, packet: IpcPacket) => {
      if (packet.debugMessage) {
        // eslint-disable-next-line no-console
        console.log(packet.debugMessage);
        event.returnValue = true;
      }

      if (packet.reloadApplication) {
        // eslint-disable-next-line no-console
        console.log('##REBOOT_ME_AFTER_CLOSE');
        appWindowManager.closeMainWindow();
        event.returnValue = true;
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

      if (packet.widgetModeChanged !== undefined) {
        appWindowManager.adjustWindowSize(packet.widgetModeChanged);
        event.returnValue = true;
      }

      //async messages

      if (packet.writeKeymappingToDevice) {
        const profile = appGlobal.profileManager.getCurrentProfile();
        if (profile) {
          KeyMappingEmitter.emitKeyAssignsToDevice(profile);
        }
      }
    });

    ipcMain.on(
      'profileManagerCommands',
      (event, commands: IProfileManagerCommand[]) => {
        appGlobal.profileManager.executeCommands(commands);
      }
    );

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
      },
      appWindowEvents: {
        subscribe(listener) {
          appGlobal.eventBus.on('appWindowEvent', listener);
        },
        unsubscribe(listener) {
          appGlobal.eventBus.off('appWindowEvent', listener);
        }
      }
    };
    xpcMain.supplyBackendAgent('default', backendAgent);
  }

  async terminate() {}
}
