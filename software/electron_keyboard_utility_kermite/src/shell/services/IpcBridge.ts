import { ipcMain } from 'electron';
import {
  IBackendAgent,
  ISynchronousIpcPacket,
  IProfileManagerCommand
} from '~defs/IpcContract';
import { xpcMain } from '~lib/xpc/xpcMain';
import { appWindowManager } from '../base/AppWindowManager';
import { KeyMappingEmitter } from './KeyMappingEmitter';
import {
  IKeyboardConfig,
  IEnvironmentConfigForRendererProcess,
  IApplicationSettings
} from '~defs/ConfigTypes';
import { appEnv } from '../base/AppEnvironment';
import { IKeyboardShape } from '~defs/ProfileData';
import { keyboardConfigProvider } from './KeyboardConfigProvider';
import { profileManager } from './ProfileManager';
import { deviceService } from './KeyboardDevice';
import { firmwareUpdationService } from './FirmwareUpdation';
import { applicationSettingsProvider } from './ApplicationSettingsProvider';
import { keyboardShapesProvider } from './KeyboardShapesProvider';
import { appEventBus } from '~shell/base/AppEventBus';

function setupSynchronousMessageHandler() {
  ipcMain.on('synchronousMessage', (event, packet: ISynchronousIpcPacket) => {
    if (packet.debugMessage) {
      console.log(packet.debugMessage);
      event.returnValue = true;
    }

    if (packet.reserveSaveProfileTask) {
      profileManager.reserveSaveProfileTask(packet.reserveSaveProfileTask);
      event.returnValue = true;
    }

    if (packet.saveSettingsOnClosing) {
      applicationSettingsProvider.writeSettings(packet.saveSettingsOnClosing);
      event.returnValue = true;
    }

    if (packet.saveKeyboardConfigOnClosing) {
      keyboardConfigProvider.writeKeyboardConfig(
        packet.saveKeyboardConfigOnClosing
      );
      event.returnValue = true;
    }
  });
}

function createBackendAgent(): IBackendAgent {
  return {
    async getEnvironmentConfig(): Promise<
      IEnvironmentConfigForRendererProcess
    > {
      return {
        isDevelopment: appEnv.isDevelopment
      };
    },
    async getSettings(): Promise<IApplicationSettings> {
      return applicationSettingsProvider.getSettings();
    },
    async getKeyboardConfig(): Promise<IKeyboardConfig> {
      return keyboardConfigProvider.keyboardConfig;
    },
    async writeKeyboardConfig(config: IKeyboardConfig): Promise<void> {
      keyboardConfigProvider.writeKeyboardConfig(config);
    },
    async writeKeyMappingToDevice(): Promise<void> {
      const profile = profileManager.getCurrentProfile();
      const layoutStandard =
        keyboardConfigProvider.keyboardConfig.layoutStandard;
      if (profile) {
        KeyMappingEmitter.emitKeyAssignsToDevice(profile, layoutStandard);
      }
    },
    async executeProfileManagerCommands(
      commands: IProfileManagerCommand[]
    ): Promise<void> {
      profileManager.executeCommands(commands);
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
      return keyboardShapesProvider.getAvailableBreedNames();
    },
    async getKeyboardShape(
      breedName: string
    ): Promise<IKeyboardShape | undefined> {
      return keyboardShapesProvider.getKeyboardShapeByBreedName(breedName);
    },
    keyEvents: {
      subscribe(listener) {
        deviceService.subscribe(listener);
      },
      unsubscribe(listener) {
        deviceService.unsubscribe(listener);
      }
    },
    profileStatusEvents: {
      subscribe(listener) {
        profileManager.subscribeStatus(listener);
      },
      unsubscribe(listener) {
        profileManager.unsubscribeStatus(listener);
      }
    },
    appWindowEvents: {
      subscribe(listener) {
        appEventBus.on('appWindowEvent', listener);
      },
      unsubscribe(listener) {
        appEventBus.off('appWindowEvent', listener);
      }
    },
    keyboardDeviceStatusEvents: {
      subscribe(listener) {
        deviceService.deviceStatus.subscribe(listener);
      },
      unsubscribe(listener) {
        deviceService.deviceStatus.unsubscribe(listener);
      }
    },
    async getFirmwareNamesAvailable(): Promise<string[]> {
      return firmwareUpdationService.getFirmwareNamesAvailable();
    },
    async uploadFirmware(
      firmwareName: string,
      comPortName: string
    ): Promise<string> {
      return await firmwareUpdationService.writeFirmware(
        firmwareName,
        comPortName
      );
    },
    comPortPlugEvents: {
      subscribe(listener) {
        firmwareUpdationService.subscribeComPorts(listener);
      },
      unsubscribe(listener) {
        firmwareUpdationService.unsubscribeComPorts(listener);
      }
    },
    layoutFileUpdationEvents: {
      subscribe(listener) {
        keyboardShapesProvider.subscribeFileUpdation(listener);
      },
      unsubscribe(listener) {
        keyboardShapesProvider.unsubscribeFileUpdation(listener);
      }
    }
  };
}

// 画面からサービスを呼び出すRPCのバックエンド実装
class IpcBridge {
  async initialize() {
    setupSynchronousMessageHandler();
    const backendAgent = createBackendAgent();
    xpcMain.supplyBackendAgent('default', backendAgent);
  }

  async terminate() {}
}

export const ipcBridge = new IpcBridge();
