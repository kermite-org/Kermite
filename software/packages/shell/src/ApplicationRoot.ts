import { IProfileManagerStatus } from '@kermite/shared';
import { appGlobal, applicationStorage } from '~/base';
import { ProfileService } from '~/services/profile';
import { WindowService } from '~/services/window';
import { FirmwareUpdationService } from '~/services0/FirmwareUpdation';
import { KeyMappingEmitter } from '~/services0/KeyMappingEmitter';
import { KeyboardConfigProvider } from '~/services0/KeyboardConfigProvider';
import { KeyboardDeviceService } from '~/services0/KeyboardDevice';
import { InputLogicSimulatorD } from '~/services0/KeyboardLogic/InputLogicSimulatorD';
import { KeyboardLayoutFilesWatcher } from '~/services0/KeyboardShape/KeyboardLayoutFilesWatcher';
import { KeyboardShapesProvider } from '~/services0/KeyboardShape/KeyboardShapesProvider';
import { PresetProfileLoader } from '~/services0/PresetProfileLoader';
import { ProjectResourceInfoProvider } from '~/services0/ProjectResource/ProjectResourceInfoProvider';
import { resourceUpdator_syncRemoteResourcesToLocal } from '~/services0/ResourceUpdator';

export class ApplicationRoot {
  private windowService = new WindowService();

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

  private profileService = new ProfileService(this.presetProfileLoader);
  private profileManager = this.profileService.profileManager;

  private inputLogicSimulator = new InputLogicSimulatorD(
    this.profileManager,
    this.keyboardConfigProvider,
    this.deviceService,
  );

  // ------------------------------------------------------------

  private setupIpcBackend() {
    const windowWrapper = this.windowService.getWindowWrapper();

    appGlobal.icpMainAgent.supplySyncHandlers({
      dev_getVersionSync: () => 'v100',
      dev_debugMessage: (msg) => console.log(`[renderer] ${msg}`),
      profile_reserveSaveProfileTask: (data) =>
        this.profileManager.reserveSaveProfileTask(data),
      config_saveKeyboardConfigOnClosing: (data) =>
        this.keyboardConfigProvider.writeKeyboardConfig(data),
    });

    appGlobal.icpMainAgent.supplyAsyncHandlers({
      dev_getVersion: async () => 'v100',
      dev_addNumber: async (a: number, b: number) => a + b,
      window_closeWindow: async () => windowWrapper.closeMainWindow(),
      window_minimizeWindow: async () => windowWrapper.minimizeMainWindow(),
      window_maximizeWindow: async () => windowWrapper.maximizeMainWindow(),
      // window_reloadApplication: async () => {
      //   console.log('##REBOOT_ME_AFTER_CLOSE');
      //   this.appWindowManager.closeMainWindow();
      // },
      // window_widgetModeChanged: async (isWidgetMode) =>
      //   this.appWindowManager.adjustWindowSize(isWidgetMode),
      profile_executeProfileManagerCommands: (commands) =>
        this.profileService.profileManager.executeCommands(commands),
      projects_loadKeyboardShape: (projectId, layoutName) =>
        this.keyboardShapesProvider.loadKeyboardShapeByProjectIdAndLayoutName(
          projectId,
          layoutName,
        ),
      firmup_uploadFirmware: (projectId, comPortName) =>
        this.firmwareUpdationService.writeFirmware(projectId, comPortName),
      projects_getAllProjectResourceInfos: async () =>
        this.projectResourceInfoProvider.getAllProjectResourceInfos(),
      projects_loadPresetProfile: (profileId, presetName: string) =>
        this.presetProfileLoader.loadPresetProfileData(profileId, presetName),
      config_getKeyboardConfig: async () =>
        this.keyboardConfigProvider.keyboardConfig,
      config_writeKeyboardConfig: async (config) =>
        this.keyboardConfigProvider.writeKeyboardConfig(config),
      config_writeKeyMappingToDevice: async () => {
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
      },
    });

    appGlobal.icpMainAgent.supplySubscriptionHandlers({
      dev_testEvent: (cb) => {
        // eslint-disable-next-line standard/no-callback-literal
        cb({ type: 'test_event_with_supplySubscriptionHandlers' });
        return () => {};
      },
      profile_profileManagerStatus: (cb) => {
        this.profileManager.statusEventPort.subscribe(cb);
        return () => this.profileManager.statusEventPort.unsubscribe(cb);
      },
      profile_currentProfile: (cb) => {
        const cb2 = (value: Partial<IProfileManagerStatus>) => {
          if ('loadedProfileData' in value) {
            cb(value.loadedProfileData);
          }
        };
        this.profileManager.statusEventPort.subscribe(cb2);
        return () => this.profileManager.statusEventPort.unsubscribe(cb2);
      },
      device_keyEvents: (cb) => {
        this.deviceService.realtimeEventPort.subscribe(cb);
        return () => this.deviceService.realtimeEventPort.unsubscribe(cb);
      },
      device_keyboardDeviceStatusEvents: (cb) => {
        this.deviceService.statusEventPort.subscribe(cb);
        return () => this.deviceService.statusEventPort.unsubscribe(cb);
      },
      firmup_comPortPlugEvents: (cb) => {
        this.firmwareUpdationService.comPortPlugEvents.subscribe(cb);
        return () =>
          this.firmwareUpdationService.comPortPlugEvents.unsubscribe(cb);
      },
      projects_layoutFileUpdationEvents: (cb) => {
        this.keyboardLayoutFilesWatcher.fileUpdationEventPort.subscribe(cb);
        return () =>
          this.keyboardLayoutFilesWatcher.fileUpdationEventPort.unsubscribe(cb);
      },
      window_appWindowEvents: windowWrapper.onAppWindowEvent,
    });
  }

  async initialize() {
    console.log(`initialize services`);
    await applicationStorage.initialize();
    await resourceUpdator_syncRemoteResourcesToLocal();
    await this.projectResourceInfoProvider.initializeAsync();
    await this.profileService.initialize();
    this.firmwareUpdationService.initialize();
    this.keyboardLayoutFilesWatcher.initialize();
    this.keyboardConfigProvider.initialize();
    this.deviceService.initialize();
    this.inputLogicSimulator.initialize();

    this.setupIpcBackend();
    this.windowService.initialize();
  }

  async terminate() {
    console.log(`terminate services`);
    this.windowService.terminate();
    this.inputLogicSimulator.terminate();
    this.deviceService.terminate();
    this.keyboardConfigProvider.terminate();
    this.keyboardLayoutFilesWatcher.terminate();
    this.firmwareUpdationService.terminate();
    await this.profileService.terminate();
    await applicationStorage.terminate();
  }
}
