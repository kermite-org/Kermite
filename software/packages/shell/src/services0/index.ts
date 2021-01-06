import {
  IKeyboardConfig,
  IProfileManagerCommand,
  IKeyboardShape,
  IProjectResourceInfo,
  IProfileData,
} from '@kermite/shared';
import { ipcMain } from 'electron';
import { applicationStorage } from '~/base';
import { ProfileManager } from '~/services/profile/ProfileManager/ProfileManager';
import { FirmwareUpdationService } from './FirmwareUpdation';
import { KeyMappingEmitter } from './KeyMappingEmitter';
import { KeyboardConfigProvider } from './KeyboardConfigProvider';
import { KeyboardDeviceService } from './KeyboardDevice';
import { InputLogicSimulatorD } from './KeyboardLogic/InputLogicSimulatorD';
import { KeyboardLayoutFilesWatcher } from './KeyboardShape/KeyboardLayoutFilesWatcher';
import { KeyboardShapesProvider } from './KeyboardShape/KeyboardShapesProvider';
import { PresetProfileLoader } from './PresetProfileLoader';
import { ProjectResourceInfoProvider } from './ProjectResource/ProjectResourceInfoProvider';
import { resourceUpdator_syncRemoteResourcesToLocal } from './ResourceUpdator';

export class Services {
  private projectResourceInfoProvider = new ProjectResourceInfoProvider();
  private keyboardConfigProvider = new KeyboardConfigProvider();

  private keyboardLayoutFilesWatcher = new KeyboardLayoutFilesWatcher(
    this.projectResourceInfoProvider,
  );

  private keyboardShapesProvider = new KeyboardShapesProvider(
    this.projectResourceInfoProvider,
  );

  private firmwareUpdationService = new FirmwareUpdationService(
    this.projectResourceInfoProvider,
  );

  private deviceService = new KeyboardDeviceService(
    this.projectResourceInfoProvider,
  );

  private presetProfileLoader = new PresetProfileLoader(
    this.projectResourceInfoProvider,
  );

  private profileManager = new ProfileManager(this.presetProfileLoader);

  private inputLogicSimulator = new InputLogicSimulatorD(
    this.profileManager,
    this.keyboardConfigProvider,
    this.deviceService,
  );

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
        this.deviceService,
      );
    }
  }

  async executeProfileManagerCommands(
    commands: IProfileManagerCommand[],
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

  async loadKeyboardShape(
    projectId: string,
    layoutName: string,
  ): Promise<IKeyboardShape | undefined> {
    return await this.keyboardShapesProvider.loadKeyboardShapeByProjectIdAndLayoutName(
      projectId,
      layoutName,
    );
  }

  async uploadFirmware(
    projectId: string,
    comPortName: string,
  ): Promise<string> {
    return await this.firmwareUpdationService.writeFirmware(
      projectId,
      comPortName,
    );
  }

  async getAllProjectResourceInfos(): Promise<IProjectResourceInfo[]> {
    return this.projectResourceInfoProvider.getAllProjectResourceInfos();
  }

  async loadPresetProfile(
    profileId: string,
    presetName: string,
  ): Promise<IProfileData | undefined> {
    return await this.presetProfileLoader.loadPresetProfileData(
      profileId,
      presetName,
    );
  }

  keyboardDeviceStatusEvents = this.deviceService.statusEventPort;

  keyEvents = this.deviceService.realtimeEventPort;

  profileStatusEvents = this.profileManager.statusEventPort;

  comPortPlugEvents = this.firmwareUpdationService.comPortPlugEvents;

  layoutFileUpdationEvents = this.keyboardLayoutFilesWatcher
    .fileUpdationEventPort;

  appWindowEvents = appWindowEventHub;

  private handleSynchronousMessagePacket(packet: ISynchronousIpcPacket) {
    if (packet.debugMessage) {
      console.log(packet.debugMessage);
    }
    if (packet.reserveSaveProfileTask) {
      this.profileManager.reserveSaveProfileTask(packet.reserveSaveProfileTask);
    }
    if (packet.saveSettingsOnClosing) {
      this.applicationSettingsProvider.writeSettings(
        packet.saveSettingsOnClosing,
      );
    }
    if (packet.saveKeyboardConfigOnClosing) {
      this.keyboardConfigProvider.writeKeyboardConfig(
        packet.saveKeyboardConfigOnClosing,
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
