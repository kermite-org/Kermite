import { ipcMain } from 'electron';
import {
  IBackendAgent,
  ISynchronousIpcPacket,
  IProfileManagerCommand
} from '~defs/ipc';
import { xpcMain } from '~funcs/xpc/xpcMain';
import { appWindowManager } from '~shell/AppWindowManager';
import { appGlobal } from './appGlobal';
import { KeyMappingEmitter } from './KeyMappingEmitter';
import {
  IKeyboardConfig,
  IEnvironmentConfigForRendererProcess,
  IApplicationSettings
} from '~defs/ConfigTypes';
import { environmentConfig } from '~shell/AppEnvironment';
import { IKeyboardShape } from '~defs/ProfileData';
import { backendAgent } from '~ui2/models/dataSource/ipc';

function createBackendAgent(): IBackendAgent {
  return {
    async getEnvironmentConfig(): Promise<
      IEnvironmentConfigForRendererProcess
    > {
      return {
        isDevelopment: environmentConfig.isDevelopment
      };
    },
    async getSettings(): Promise<IApplicationSettings> {
      return appGlobal.settingsProvider.getSettings();
    },
    async getKeyboardConfig(): Promise<IKeyboardConfig> {
      return appGlobal.keyboardConfigProvider.keyboardConfig;
    },
    async writeKeyboardConfig(config: IKeyboardConfig): Promise<void> {
      appGlobal.keyboardConfigProvider.writeKeyboardConfig(config);
    },
    async writeKeyMappingToDevice(): Promise<void> {
      const profile = appGlobal.profileManager.getCurrentProfile();
      const layoutStandard =
        appGlobal.keyboardConfigProvider.keyboardConfig.layoutStandard;
      if (profile) {
        KeyMappingEmitter.emitKeyAssignsToDevice(profile, layoutStandard);
      }
    },
    async executeProfileManagerCommands(
      commands: IProfileManagerCommand[]
    ): Promise<void> {
      appGlobal.profileManager.executeCommands(commands);
    },

    async reloadApplication(): Promise<void> {
      // eslint-disable-next-line no-console
      console.log('##REBOOT_ME_AFTER_CLOSE');
      appWindowManager.closeMainWindow();
    },
    async closeWindow(): Promise<void> {
      appWindowManager.closeMainWindow();
    },
    async minimizeWindow(): Promise<void> {
      appWindowManager.minimizeMainWindow();
    },
    async maximizeWindow(): Promise<void> {
      appWindowManager.maximizeMainWindow();
    },
    async widgetModeChanged(isWidgetMode: boolean): Promise<void> {
      appWindowManager.adjustWindowSize(isWidgetMode);
    },
    async getKeyboardBreedNamesAvailable(): Promise<string[]> {
      return appGlobal.shapeProvider.getAvailableBreedNames();
    },
    async getKeyboardShape(
      breedName: string
    ): Promise<IKeyboardShape | undefined> {
      return appGlobal.shapeProvider.getKeyboardShapeByBreedName(breedName);
    },
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
    },
    keyboardDeviceStatusEvents: {
      subscribe(listener) {
        appGlobal.deviceService.deviceStatus.subscribe(listener);
      },
      unsubscribe(listener) {
        appGlobal.deviceService.deviceStatus.unsubscribe(listener);
      }
    },
    async getFirmwareNamesAvailable(): Promise<string[]> {
      return appGlobal.firmwareUpdationService.getFirmwareNamesAvailable();
    },
    async uploadFirmware(
      firmwareName: string,
      comPortName: string
    ): Promise<string> {
      return appGlobal.firmwareUpdationService.writeFirmware(
        firmwareName,
        comPortName
      );
    },
    comPortPlugEvents: {
      subscribe(listener) {
        appGlobal.firmwareUpdationService.subscribeComPorts(listener);
      },
      unsubscribe(listener) {
        appGlobal.firmwareUpdationService.unsubscribeComPorts(listener);
      }
    },
    layoutFileUpdationEvents: {
      subscribe(listener) {
        appGlobal.shapeProvider.subscribeFileUpdation(listener);
      },
      unsubscribe(listener) {
        appGlobal.shapeProvider.unsubscribeFileUpdation(listener);
      }
    }
  };
}

export class IpcBridge {
  async initialize() {
    ipcMain.on('synchronousMessage', (event, packet: ISynchronousIpcPacket) => {
      if (packet.debugMessage) {
        // eslint-disable-next-line no-console
        console.log(packet.debugMessage);
        event.returnValue = true;
      }

      if (packet.reserveSaveProfileTask) {
        appGlobal.profileManager.reserveSaveProfileTask(
          packet.reserveSaveProfileTask
        );
        event.returnValue = true;
      }

      if (packet.saveSettingsOnClosing) {
        appGlobal.settingsProvider.writeSettings(packet.saveSettingsOnClosing);
        event.returnValue = true;
      }

      if (packet.saveKeyboardConfigOnClosing) {
        appGlobal.keyboardConfigProvider.writeKeyboardConfig(
          packet.saveKeyboardConfigOnClosing
        );
        event.returnValue = true;
      }
    });
    const backendAgent = createBackendAgent();
    xpcMain.supplyBackendAgent('default', backendAgent);
  }

  async terminate() {}
}
