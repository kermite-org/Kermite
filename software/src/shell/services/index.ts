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
import { IKeyboardShape, IProjectResourceInfo } from '~defs/ProfileData';
import { IEventSource } from '~lib/xpc/types';
import { RpcEventSource, RpcFunction, xpcMain } from '~lib/xpc/xpcMain';
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
import { ProjectResourceInfoProvider } from './ProjectResource/ProjectResourceInfoProvider';
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

  private projectResourceInfoProvider = new ProjectResourceInfoProvider();

  @RpcFunction
  async getEnvironmentConfig(): Promise<IEnvironmentConfigForRendererProcess> {
    return {
      isDevelopment: appEnv.isDevelopment
    };
  }

  @RpcFunction
  async getSettings(): Promise<IApplicationSettings> {
    return this.applicationSettingsProvider.getSettings();
  }

  @RpcFunction
  async getKeyboardConfig(): Promise<IKeyboardConfig> {
    return this.keyboardConfigProvider.keyboardConfig;
  }

  @RpcFunction
  async writeKeyboardConfig(config: IKeyboardConfig): Promise<void> {
    this.keyboardConfigProvider.writeKeyboardConfig(config);
  }

  @RpcFunction
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

  @RpcFunction
  async executeProfileManagerCommands(
    commands: IProfileManagerCommand[]
  ): Promise<void> {
    this.profileManager.executeCommands(commands);
  }

  @RpcFunction
  async reloadApplication(): Promise<void> {
    console.log('##REBOOT_ME_AFTER_CLOSE');
    appWindowManager.closeMainWindow();
  }

  @RpcFunction
  async closeWindow(): Promise<void> {
    appWindowManager.closeMainWindow();
  }

  @RpcFunction
  async minimizeWindow(): Promise<void> {
    appWindowManager.minimizeMainWindow();
  }

  @RpcFunction
  async maximizeWindow(): Promise<void> {
    appWindowManager.maximizeMainWindow();
  }

  @RpcFunction
  async widgetModeChanged(isWidgetMode: boolean): Promise<void> {
    appWindowManager.adjustWindowSize(isWidgetMode);
  }

  @RpcFunction
  async getKeyboardBreedNamesAvailable(): Promise<string[]> {
    return this.keyboardShapesProvider.getAvailableBreedNames();
  }

  @RpcFunction
  async getKeyboardShape(
    breedName: string
  ): Promise<IKeyboardShape | undefined> {
    return this.keyboardShapesProvider.getKeyboardShapeByBreedName(breedName);
  }

  @RpcEventSource
  keyEvents = this.deviceService.realtimeEvents;

  @RpcEventSource
  profileStatusEvents = this.profileManager.statusEvents;

  @RpcEventSource
  appWindowEvents: IEventSource<IAppWindowEvent> = {
    subscribe(listener) {
      appEventBus.on('appWindowEvent', listener);
    },
    unsubscribe(listener) {
      appEventBus.off('appWindowEvent', listener);
    }
  };

  @RpcEventSource
  keyboardDeviceStatusEvents = this.deviceService.deviceStatus;

  @RpcFunction
  async getFirmwareNamesAvailable(): Promise<string[]> {
    return this.firmwareUpdationService.getFirmwareNamesAvailable();
  }

  @RpcFunction
  async uploadFirmware(
    firmwareName: string,
    comPortName: string
  ): Promise<string> {
    return await this.firmwareUpdationService.writeFirmware(
      firmwareName,
      comPortName
    );
  }

  @RpcEventSource
  comPortPlugEvents = this.firmwareUpdationService.comPortPlugEvents;

  @RpcEventSource
  layoutFileUpdationEvents = this.keyboardShapesProvider.fileUpdationEvents;

  @RpcFunction
  async getAllProjectResourceInfos(): Promise<IProjectResourceInfo[]> {
    return this.projectResourceInfoProvider.getAllProjectResourceInfos();
  }

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
    await this.projectResourceInfoProvider.initialize();
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
