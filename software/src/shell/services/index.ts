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
import { KeyboardLayoutFilesWatcher } from './KeyboardShape/KeyboardLayoutFilesWatcher';
import { KeyboardShapesProvider } from './KeyboardShape/KeyboardShapesProvider';
import { ProfileManager } from './ProfileManager';
import { ProjectResourceInfoProvider } from './ProjectResource/ProjectResourceInfoProvider';
import { resourceUpdator_syncRemoteResourcesToLocal } from './ResourceUpdator';

export class Services implements IBackendAgent {
  private applicationSettingsProvider = new ApplicationSettingsProvider();
  private projectResourceInfoProvider = new ProjectResourceInfoProvider();
  private keyboardConfigProvider = new KeyboardConfigProvider();
  private keyboardLayoutFilesWatcher = new KeyboardLayoutFilesWatcher();

  private keyboardShapesProvider = new KeyboardShapesProvider(
    this.projectResourceInfoProvider
  );

  private firmwareUpdationService = new FirmwareUpdationService(
    this.projectResourceInfoProvider
  );

  private deviceService = new KeyboardDeviceService(
    this.projectResourceInfoProvider
  );

  private profileManager = new ProfileManager(this.keyboardShapesProvider);

  private inputLogicSimulator = new InputLogicSimulatorD(
    this.profileManager,
    this.keyboardConfigProvider,
    this.deviceService
  );

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
    return await this.keyboardShapesProvider.loadKeyboardShapeByBreedName(
      breedName
    );
  }

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

  @RpcFunction
  async getAllProjectResourceInfos(): Promise<IProjectResourceInfo[]> {
    return this.projectResourceInfoProvider.getAllProjectResourceInfos();
  }

  @RpcEventSource
  keyboardDeviceStatusEvents = this.deviceService.deviceStatus;

  @RpcEventSource
  keyEvents = this.deviceService.realtimeEventPort;

  @RpcEventSource
  profileStatusEvents = this.profileManager.statusEventPort;

  @RpcEventSource
  comPortPlugEvents = this.firmwareUpdationService.comPortPlugEvents;

  @RpcEventSource
  layoutFileUpdationEvents = this.keyboardLayoutFilesWatcher
    .fileUpdationEventPort;

  @RpcEventSource
  appWindowEvents: IEventSource<IAppWindowEvent> = {
    subscribe(listener) {
      appEventBus.on('appWindowEvent', listener);
    },
    unsubscribe(listener) {
      appEventBus.off('appWindowEvent', listener);
    }
  };

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
    await applicationStorage.initializeAsync();
    this.applicationSettingsProvider.initialize();

    await this.projectResourceInfoProvider.initializeAsync();
    this.firmwareUpdationService.initialize();
    this.keyboardLayoutFilesWatcher.initialize();
    await this.profileManager.initializeAsync();

    this.keyboardConfigProvider.initialize();
    this.deviceService.initialize();
    this.inputLogicSimulator.initialize();

    ipcMain.on('synchronousMessage', (event, packet: ISynchronousIpcPacket) => {
      this.handleSynchronousMessagePacket(packet);
      event.returnValue = true;
    });
    xpcMain.supplyBackendAgent('default', this as IBackendAgent);
  }

  async terminate() {
    console.log(`terminate services`);
    this.inputLogicSimulator.terminate();
    this.deviceService.terminate();
    this.keyboardConfigProvider.terminate();
    this.keyboardLayoutFilesWatcher.terminate();
    this.firmwareUpdationService.terminate();
    await this.profileManager.terminateAsync();

    this.applicationSettingsProvider.terminate();
    await applicationStorage.terminateAsync();
  }
}
