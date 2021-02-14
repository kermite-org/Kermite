import { IPresetSpec, IProfileManagerStatus } from '~/shared';
import { appEnv, appGlobal, applicationStorage } from '~/shell/base';
import {
  executeWithFatalErrorHandler,
  getAppErrorInfo,
  makeCompactStackTrace,
} from '~/shell/base/ErrorChecker';
import { pathResolve } from '~/shell/funcs';
import { projectResourceProvider } from '~/shell/projectResources';
import { KeyboardLayoutFilesWatcher } from '~/shell/projectResources/KeyboardShape/KeyboardLayoutFilesWatcher';
import { GlobalSettingsProvider } from '~/shell/services/config/GlobalSettingsProvider';
import { KeyboardConfigProvider } from '~/shell/services/config/KeyboardConfigProvider';
import { KeyMappingEmitter } from '~/shell/services/device/KeyMappingEmitter';
import { KeyboardDeviceService } from '~/shell/services/device/KeyboardDevice';
import { JsonFileServiceStatic } from '~/shell/services/file/JsonFileServiceStatic';
import { FirmwareUpdationService } from '~/shell/services/firmwareUpdation';
import { InputLogicSimulatorD } from '~/shell/services/keyboardLogic/InputLogicSimulatorD';
import { LayoutManager } from '~/shell/services/layout/LayoutManager';
import { PresetProfileLoader } from '~/shell/services/profile/PresetProfileLoader';
import { ProfileManager } from '~/shell/services/profile/ProfileManager';
import { AppWindowWrapper } from '~/shell/services/window';

export class ApplicationRoot {
  private windowWrapper = new AppWindowWrapper();
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
    const windowWrapper = this.windowWrapper;

    appGlobal.icpMainAgent.setErrorHandler((error) => {
      console.error(makeCompactStackTrace(error));
      appGlobal.appErrorEventPort.emit(getAppErrorInfo(error));
    });

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
      window_reloadPage: async () => windowWrapper.reloadPage(),
      window_setDevToolVisibility: async (visible) =>
        windowWrapper.setDevToolsVisibility(visible),
      profile_executeProfileManagerCommands: (commands) =>
        this.profileManager.executeCommands(commands),
      layout_executeLayoutManagerCommands: (commands) =>
        this.layoutManager.executeCommands(commands),
      // layout_getAllProjectLayoutsInfos: () =>
      //   this.layoutManager.getAllProjectLayoutsInfos(),
      layout_clearErrorInfo: async () => this.layoutManager.clearErrorInfo(),
      layout_showEditLayoutFileInFiler: async () =>
        this.layoutManager.showEditLayoutFileInFiler(),
      projects_loadKeyboardShape: (origin, projectId, layoutName) =>
        projectResourceProvider.loadProjectLayout(
          origin,
          projectId,
          layoutName,
        ),
      firmup_uploadFirmware: (origin, projectId, comPortName) =>
        this.firmwareUpdationService.writeFirmware(
          origin,
          projectId,
          comPortName,
        ),
      projects_getAllProjectResourceInfos: () =>
        projectResourceProvider.getAllProjectResourceInfos(),
      projects_loadPresetProfile: (
        origin,
        profileId,
        presetSpec: IPresetSpec,
      ) =>
        this.presetProfileLoader.loadPresetProfileData(
          origin,
          profileId,
          presetSpec,
        ),
      config_getKeyboardConfig: async () =>
        this.keyboardConfigProvider.getKeyboardConfig(),
      config_writeKeyboardConfig: async (config) =>
        this.keyboardConfigProvider.writeKeyboardConfig(config),
      config_writeKeyMappingToDevice: async () => {
        const profile = this.profileManager.getCurrentProfile();
        const layoutStandard = this.keyboardConfigProvider.getKeyboardConfig()
          .layoutStandard;
        if (profile) {
          await KeyMappingEmitter.emitKeyAssignsToDevice(
            profile,
            layoutStandard,
            this.deviceService,
          );
        }
      },
      config_getGlobalSettings: async () =>
        GlobalSettingsProvider.getGlobalSettings(),
      config_writeGlobalSettings: async (settings) =>
        GlobalSettingsProvider.writeGlobalSettings(settings),
      config_getProjectRootDirectoryPath: async () => {
        if (appEnv.isDevelopment) {
          return pathResolve('..');
        } else {
          const settings = GlobalSettingsProvider.getGlobalSettings();
          return settings.localProjectRootFolderPath;
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
      file_getOpenDirectoryWithDialog:
        JsonFileServiceStatic.getOpeningDirectoryPathWithDialog,
      global_triggerLazyInitializeServices: () => this.lazyInitialzeServices(),
    });

    appGlobal.icpMainAgent.supplySubscriptionHandlers({
      dev_testEvent: (cb) => {
        // eslint-disable-next-line standard/no-callback-literal
        cb({ type: 'test_event_with_supplySubscriptionHandlers' });
        return () => {};
      },
      global_appErrorEvents: (cb) => appGlobal.appErrorEventPort.subscribe(cb),
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
      firmup_comPortPlugEvents: (cb) =>
        this.firmwareUpdationService.comPortsMonitor.comPortPlugEvents.subscribe(
          cb,
        ),
      projects_layoutFileUpdationEvents: (cb) =>
        this.keyboardLayoutFilesWatcher.fileUpdationEvents.subscribe(cb),
      window_appWindowStatus: windowWrapper.appWindowEventPort.subscribe,
    });
  }

  async initialize() {
    await executeWithFatalErrorHandler(async () => {
      console.log(`initialize services`);
      await applicationStorage.initializeAsync();
      this.setupIpcBackend();
      this.windowWrapper.initialize();
    });
  }

  private _lazyInitializeTriggered = false;
  async lazyInitialzeServices() {
    if (!this._lazyInitializeTriggered) {
      this._lazyInitializeTriggered = true;
      await this.profileManager.initializeAsync();
      this.deviceService.initialize();
      this.inputLogicSimulator.initialize();
    }
  }

  async terminate() {
    await executeWithFatalErrorHandler(async () => {
      console.log(`terminate services`);
      this.inputLogicSimulator.terminate();
      this.deviceService.terminate();
      this.windowWrapper.terminate();
      await this.profileManager.terminateAsync();
      await applicationStorage.terminateAsync();
    });
  }
}
