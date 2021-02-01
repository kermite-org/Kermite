import { IPresetSpec, IProfileManagerStatus } from '~/shared';
import { appGlobal, applicationStorage } from '~/shell/base';
import { projectResourceInfoProvider } from '~/shell/projects';
import { KeyboardLayoutFilesWatcher } from '~/shell/projects/KeyboardShape/KeyboardLayoutFilesWatcher';
import { PresetProfileLoader } from '~/shell/projects/PresetProfileLoader';
import { KeyboardConfigProvider } from '~/shell/services/config/KeyboardConfigProvider';
import { KeyMappingEmitter } from '~/shell/services/device/KeyMappingEmitter';
import { KeyboardDeviceService } from '~/shell/services/device/KeyboardDevice';
import { JsonFileServiceStatic } from '~/shell/services/file/JsonFileServiceStatic';
import { FirmwareUpdationService } from '~/shell/services/firmwareUpdation';
import { InputLogicSimulatorD } from '~/shell/services/keyboardLogic/InputLogicSimulatorD';
import { LayoutManager } from '~/shell/services/layout/LayoutManager';
import { ProfileManager } from '~/shell/services/profile/ProfileManager';
import { WindowService } from '~/shell/services/window';
// import { resourceUpdator_syncRemoteResourcesToLocal } from '~/shell/services0/ResourceUpdator';

export class ApplicationRoot {
  private windowService = new WindowService();
  private keyboardConfigProvider = new KeyboardConfigProvider();

  private keyboardLayoutFilesWatcher = new KeyboardLayoutFilesWatcher();

  private firmwareUpdationService = new FirmwareUpdationService();

  private deviceService = new KeyboardDeviceService();

  private presetProfileLoader = new PresetProfileLoader();

  private profileManager = new ProfileManager(this.presetProfileLoader);

  private layoutManager = new LayoutManager(this.profileManager);

  private inputLogicSimulator = new InputLogicSimulatorD(
    this.profileManager,
    this.keyboardConfigProvider,
    this.deviceService,
  );

  // ------------------------------------------------------------

  private setupIpcBackend() {
    const windowWrapper = this.windowService.getWindowWrapper();
    const pageManger = this.windowService.getPageManager();

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
      window_restartApplication: async () => windowWrapper.restartApplication(),
      window_setDevToolVisibility: async (visible) =>
        pageManger.setDevToolVisiblity(visible),
      // windowWrapper.setDevToolsVisibility(visible),
      // window_widgetModeChanged: async (isWidgetMode) =>
      //   this.appWindowManager.adjustWindowSize(isWidgetMode),
      profile_executeProfileManagerCommands: (commands) =>
        this.profileManager.executeCommands(commands),
      layout_executeLayoutManagerCommands: (commands) =>
        this.layoutManager.executeCommands(commands),
      // layout_getAllProjectLayoutsInfos: () =>
      //   this.layoutManager.getAllProjectLayoutsInfos(),
      layout_clearErrorInfo: async () => this.layoutManager.clearErrorInfo(),
      layout_showEditLayoutFileInFiler: async () =>
        this.layoutManager.showEditLayoutFileInFiler(),
      projects_loadKeyboardShape: (projectId, layoutName) =>
        projectResourceInfoProvider.loadProjectLayout(projectId, layoutName),
      firmup_uploadFirmware: (projectId, comPortName) =>
        this.firmwareUpdationService.writeFirmware(projectId, comPortName),
      projects_getAllProjectResourceInfos: async () =>
        projectResourceInfoProvider.getAllProjectResourceInfos(),
      projects_loadPresetProfile: (profileId, presetSpec: IPresetSpec) =>
        this.presetProfileLoader.loadPresetProfileData(profileId, presetSpec),
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
      file_getOpenJsonFilePathWithDialog:
        JsonFileServiceStatic.getOpeningJsonFilePathWithDialog,
      file_getSaveJsonFilePathWithDialog:
        JsonFileServiceStatic.getSavingJsonFilePathWithDialog,
      file_loadObjectFromJsonWithFileDialog:
        JsonFileServiceStatic.loadObjectFromJsonWithFileDialog,
      file_saveObjectToJsonWithFileDialog:
        JsonFileServiceStatic.saveObjectToJsonWithFileDialog,
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
      layout_layoutManagerStatus: (listener) =>
        this.layoutManager.statusEvents.subscribe(listener),
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
      window_appWindowEvents: windowWrapper.appWindowEventPort.subscribe,
    });
  }

  async initialize() {
    console.log(`initialize services`);
    await applicationStorage.initializeAsync();
    // await resourceUpdator_syncRemoteResourcesToLocal();
    await projectResourceInfoProvider.initializeAsync();
    await this.profileManager.initializeAsync();
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
    await this.profileManager.terminateAsync();
    await applicationStorage.terminateAsync();
  }
}
