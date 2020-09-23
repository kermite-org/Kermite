import { ipcMain } from 'electron';
import {
  IBackendAgent,
  ISynchronousIpcPacket,
  IProfileManagerCommand
} from '~defs/IpcContract';
import { xpcMain } from '~lib/xpc/xpcMain';
import { appWindowManager } from '~shell/AppWindowManager';
import { services } from './services';
import { KeyMappingEmitter } from './services/KeyMappingEmitter';
import {
  IKeyboardConfig,
  IEnvironmentConfigForRendererProcess,
  IApplicationSettings
} from '~defs/ConfigTypes';
import { environmentConfig } from '~shell/AppEnvironment';
import { IKeyboardShape } from '~defs/ProfileData';
import { backendAgent } from '~ui/models/dataSource/ipc';

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
      return services.settingsProvider.getSettings();
    },
    async getKeyboardConfig(): Promise<IKeyboardConfig> {
      return services.keyboardConfigProvider.keyboardConfig;
    },
    async writeKeyboardConfig(config: IKeyboardConfig): Promise<void> {
      services.keyboardConfigProvider.writeKeyboardConfig(config);
    },
    async writeKeyMappingToDevice(): Promise<void> {
      const profile = services.profileManager.getCurrentProfile();
      const layoutStandard =
        services.keyboardConfigProvider.keyboardConfig.layoutStandard;
      if (profile) {
        KeyMappingEmitter.emitKeyAssignsToDevice(profile, layoutStandard);
      }
    },
    async executeProfileManagerCommands(
      commands: IProfileManagerCommand[]
    ): Promise<void> {
      services.profileManager.executeCommands(commands);
    },

    async reloadApplication(): Promise<void> {
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
      return services.shapeProvider.getAvailableBreedNames();
    },
    async getKeyboardShape(
      breedName: string
    ): Promise<IKeyboardShape | undefined> {
      return services.shapeProvider.getKeyboardShapeByBreedName(breedName);
    },
    keyEvents: {
      subscribe(listener) {
        services.deviceService.subscribe(listener);
      },
      unsubscribe(listener) {
        services.deviceService.unsubscribe(listener);
      }
    },
    profileStatusEvents: {
      subscribe(listener) {
        services.profileManager.subscribeStatus(listener);
      },
      unsubscribe(listener) {
        services.profileManager.unsubscribeStatus(listener);
      }
    },
    appWindowEvents: {
      subscribe(listener) {
        services.eventBus.on('appWindowEvent', listener);
      },
      unsubscribe(listener) {
        services.eventBus.off('appWindowEvent', listener);
      }
    },
    keyboardDeviceStatusEvents: {
      subscribe(listener) {
        services.deviceService.deviceStatus.subscribe(listener);
      },
      unsubscribe(listener) {
        services.deviceService.deviceStatus.unsubscribe(listener);
      }
    },
    async getFirmwareNamesAvailable(): Promise<string[]> {
      return services.firmwareUpdationService.getFirmwareNamesAvailable();
    },
    async uploadFirmware(
      firmwareName: string,
      comPortName: string
    ): Promise<string> {
      return services.firmwareUpdationService.writeFirmware(
        firmwareName,
        comPortName
      );
    },
    comPortPlugEvents: {
      subscribe(listener) {
        services.firmwareUpdationService.subscribeComPorts(listener);
      },
      unsubscribe(listener) {
        services.firmwareUpdationService.unsubscribeComPorts(listener);
      }
    },
    layoutFileUpdationEvents: {
      subscribe(listener) {
        services.shapeProvider.subscribeFileUpdation(listener);
      },
      unsubscribe(listener) {
        services.shapeProvider.unsubscribeFileUpdation(listener);
      }
    }
  };
}

export class IpcBridge {
  async initialize() {
    ipcMain.on('synchronousMessage', (event, packet: ISynchronousIpcPacket) => {
      if (packet.debugMessage) {
        console.log(packet.debugMessage);
        event.returnValue = true;
      }

      if (packet.reserveSaveProfileTask) {
        services.profileManager.reserveSaveProfileTask(
          packet.reserveSaveProfileTask
        );
        event.returnValue = true;
      }

      if (packet.saveSettingsOnClosing) {
        services.settingsProvider.writeSettings(packet.saveSettingsOnClosing);
        event.returnValue = true;
      }

      if (packet.saveKeyboardConfigOnClosing) {
        services.keyboardConfigProvider.writeKeyboardConfig(
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
