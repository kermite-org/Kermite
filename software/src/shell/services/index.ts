import { ipcMain } from 'electron';
import {
  IApplicationSettings,
  IEnvironmentConfigForRendererProcess,
  IKeyboardConfig
} from '~defs/ConfigTypes';
import {
  IAppWindowEvent,
  IBackendAgent,
  IProfileManagerCommand,
  ISynchronousIpcPacket
} from '~defs/IpcContract';
import { IKeyboardShape } from '~defs/ProfileData';
import { IEventSource } from '~lib/xpc/types';
import { xpcMain } from '~lib/xpc/xpcMain';
import { appEnv } from '~shell/base/AppEnvironment';
import { appEventBus } from '~shell/base/AppEventBus';
import { appWindowManager } from '~shell/base/AppWindowManager';
import { ApplicationSettingsProvider } from './ApplicationSettingsProvider';
import { applicationStorage } from './ApplicationStorage';
import { FirmwareUpdationService } from './FirmwareUpdation';
import { KeyMappingEmitter } from './KeyMappingEmitter';
import { KeyboardConfigProvider } from './KeyboardConfigProvider';
import { KeyboardDeviceService } from './KeyboardDevice';
import { InputLogicSimulatorD } from './KeyboardLogic/InputLogicSimulatorD';
import { KeyboardShapesProvider } from './KeyboardShapesProvider';
import { ProfileManager } from './ProfileManager';
import { resourceUpdator_syncRemoteResourcesToLocal } from './ResourceUpdator';

export class Services implements IBackendAgent {
  private applicationSettingsProvider = new ApplicationSettingsProvider();
  private keyboardConfigProvider = new KeyboardConfigProvider();
  private keyboardShapesProvider = new KeyboardShapesProvider();
  private profileManager = new ProfileManager(this.keyboardShapesProvider);
  private deviceService = new KeyboardDeviceService();
  private firmwareUpdationService = new FirmwareUpdationService();
  private inputLogicSimulator = new InputLogicSimulatorD(
    this.profileManager,
    this.keyboardConfigProvider,
    this.deviceService
  );

  // ------------------------------------------------------------
  // PRC METHODS CALLED FROM RENDERER PROCESS

  async getEnvironmentConfig(): Promise<IEnvironmentConfigForRendererProcess> {
    return {
      isDevelopment: appEnv.isDevelopment
    };
  }

  async getSettings(): Promise<IApplicationSettings> {
    return this.applicationSettingsProvider.getSettings();
  }

  async getKeyboardConfig(): Promise<IKeyboardConfig> {
    return this.keyboardConfigProvider.keyboardConfig;
  }

  async writeKeyboardConfig(config: IKeyboardConfig): Promise<void> {
    this.keyboardConfigProvider.writeKeyboardConfig(config);
  }

  async writeKeyMappingToDevice(): Promise<void> {
    const profile = this.profileManager.getCurrentProfile();
    const layoutStandard = this.keyboardConfigProvider.keyboardConfig
      .layoutStandard;
    if (profile) {
      KeyMappingEmitter.emitKeyAssignsToDevice(
        profile,
        layoutStandard,
        this.deviceService
      );
    }
  }

  async executeProfileManagerCommands(
    commands: IProfileManagerCommand[]
  ): Promise<void> {
    this.profileManager.executeCommands(commands);
  }

  async reloadApplication(): Promise<void> {
    console.log('##REBOOT_ME_AFTER_CLOSE');
    appWindowManager.closeMainWindow();
  }

  async closeWindow(): Promise<void> {
    appWindowManager.closeMainWindow();
  }

  async minimizeWindow(): Promise<void> {
    appWindowManager.minimizeMainWindow();
  }

  async maximizeWindow(): Promise<void> {
    appWindowManager.maximizeMainWindow();
  }

  async widgetModeChanged(isWidgetMode: boolean): Promise<void> {
    appWindowManager.adjustWindowSize(isWidgetMode);
  }

  async getKeyboardBreedNamesAvailable(): Promise<string[]> {
    return this.keyboardShapesProvider.getAvailableBreedNames();
  }

  async getKeyboardShape(
    breedName: string
  ): Promise<IKeyboardShape | undefined> {
    return this.keyboardShapesProvider.getKeyboardShapeByBreedName(breedName);
  }

  keyEvents = {
    subscribe: this.deviceService.subscribe,
    unsubscribe: this.deviceService.unsubscribe
  };

  profileStatusEvents = {
    subscribe: this.profileManager.subscribeStatus,
    unsubscribe: this.profileManager.unsubscribeStatus
  };

  appWindowEvents: IEventSource<IAppWindowEvent> = {
    subscribe(listener) {
      appEventBus.on('appWindowEvent', listener);
    },
    unsubscribe(listener) {
      appEventBus.off('appWindowEvent', listener);
    }
  };

  keyboardDeviceStatusEvents = {
    subscribe: this.deviceService.deviceStatus.subscribe,
    unsubscribe: this.deviceService.deviceStatus.unsubscribe
  };

  async getFirmwareNamesAvailable(): Promise<string[]> {
    return this.firmwareUpdationService.getFirmwareNamesAvailable();
  }

  async uploadFirmware(
    firmwareName: string,
    comPortName: string
  ): Promise<string> {
    return await this.firmwareUpdationService.writeFirmware(
      firmwareName,
      comPortName
    );
  }

  comPortPlugEvents = {
    subscribe: this.firmwareUpdationService.subscribeComPorts,
    unsubscribe: this.firmwareUpdationService.unsubscribeComPorts
  };

  layoutFileUpdationEvents = {
    subscribe: this.keyboardShapesProvider.subscribeFileUpdation,
    unsubscribe: this.keyboardShapesProvider.unsubscribeFileUpdation
  };

  // ------------------------------------------------------------

  private handleSynchronousMessagePacket(packet: ISynchronousIpcPacket) {
    if (packet.debugMessage) {
      console.log(packet.debugMessage);
    }
    if (packet.reserveSaveProfileTask) {
      this.profileManager.reserveSaveProfileTask(packet.reserveSaveProfileTask);
    }
    if (packet.saveSettingsOnClosing) {
      this.applicationSettingsProvider.writeSettings(
        packet.saveSettingsOnClosing
      );
    }
    if (packet.saveKeyboardConfigOnClosing) {
      this.keyboardConfigProvider.writeKeyboardConfig(
        packet.saveKeyboardConfigOnClosing
      );
    }
  }

  // ------------------------------------------------------------

  async initialize() {
    console.log(`initialize services`);
    await resourceUpdator_syncRemoteResourcesToLocal();
    await applicationStorage.initialize();
    await this.applicationSettingsProvider.initialize();
    await this.keyboardConfigProvider.initialize();
    await this.keyboardShapesProvider.initialize();
    await this.profileManager.initialize();
    await this.deviceService.initialize();
    await this.firmwareUpdationService.initialize();
    await this.inputLogicSimulator.initialize();

    ipcMain.on('synchronousMessage', (event, packet: ISynchronousIpcPacket) => {
      this.handleSynchronousMessagePacket(packet);
      event.returnValue = true;
    });
    xpcMain.supplyBackendAgent('default', this as IBackendAgent);
  }

  async terminate() {
    console.log(`terminate services`);
    await this.inputLogicSimulator.terminate();
    await this.firmwareUpdationService.terminate();
    await this.deviceService.terminate();
    await this.profileManager.terminate();
    await this.keyboardShapesProvider.terminate();
    await this.keyboardConfigProvider.terminate();
    await this.applicationSettingsProvider.terminate();
    await applicationStorage.terminate();
  }
}
