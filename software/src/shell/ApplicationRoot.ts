/* eslint-disable @typescript-eslint/require-await */
import { getAppErrorData, IPresetSpec, makeCompactStackTrace } from '~/shared';
import { appEnv, appGlobal, applicationStorage } from '~/shell/base';
import { executeWithFatalErrorHandler } from '~/shell/base/ErrorChecker';
import { pathResolve } from '~/shell/funcs';
import { projectResourceProvider } from '~/shell/projectResources';
import { GlobalSettingsProvider } from '~/shell/services/config/GlobalSettingsProvider';
import { KeyboardConfigProvider } from '~/shell/services/config/KeyboardConfigProvider';
import { KeyboardDeviceService } from '~/shell/services/device/KeyboardDevice';
import { JsonFileServiceStatic } from '~/shell/services/file/JsonFileServiceStatic';
import { FirmwareUpdationService } from '~/shell/services/firmwareUpdation';
import { InputLogicSimulatorD } from '~/shell/services/keyboardLogic/InputLogicSimulatorD';
import { KeyboardLayoutFilesWatcher } from '~/shell/services/layout/KeyboardLayoutFilesWatcher';
import { LayoutManager } from '~/shell/services/layout/LayoutManager';
import { PresetProfileLoader } from '~/shell/services/profile/PresetProfileLoader';
import { ProfileManager } from '~/shell/services/profile/ProfileManager';
import { AppWindowWrapper } from '~/shell/services/window';

export class ApplicationRoot {
  private keyboardConfigProvider = new KeyboardConfigProvider();

  private keyboardLayoutFilesWatcher = new KeyboardLayoutFilesWatcher();

  private firmwareUpdationService = new FirmwareUpdationService();

  private deviceService = new KeyboardDeviceService();

  private presetProfileLoader = new PresetProfileLoader();

  private profileManager = new ProfileManager(this.presetProfileLoader);

  private layoutManager = new LayoutManager(
    this.presetProfileLoader,
    this.profileManager,
  );

  private inputLogicSimulator = new InputLogicSimulatorD(
    this.profileManager,
    this.keyboardConfigProvider,
    this.deviceService,
  );

  private windowWrapper = new AppWindowWrapper(this.profileManager);

  // ------------------------------------------------------------

  private setupIpcBackend() {
    const windowWrapper = this.windowWrapper;

    appGlobal.icpMainAgent.setErrorHandler((error) => {
      console.error(makeCompactStackTrace(error));
      appGlobal.appErrorEventPort.emit(
        getAppErrorData(error, appEnv.resolveApplicationRootDir()),
      );
    });

    appGlobal.icpMainAgent.supplySyncHandlers({
      dev_debugMessage: (msg) => console.log(`[renderer] ${msg}`),
      config_saveKeyboardConfigOnClosing: (data) =>
        this.keyboardConfigProvider.writeKeyboardConfig(data),
    });

    appGlobal.icpMainAgent.supplyAsyncHandlers({
      window_closeWindow: async () => windowWrapper.closeMainWindow(),
      window_minimizeWindow: async () => windowWrapper.minimizeMainWindow(),
      window_maximizeWindow: async () => windowWrapper.maximizeMainWindow(),
      window_restartApplication: async () => windowWrapper.restartApplication(),
      window_reloadPage: async () => windowWrapper.reloadPage(),
      window_setDevToolVisibility: async (visible) =>
        windowWrapper.setDevToolsVisibility(visible),
      profile_getCurrentProfile: () =>
        this.profileManager.getCurrentProfileAsync(),
      profile_executeProfileManagerCommands: (commands) =>
        this.profileManager.executeCommands(commands),
      profile_getAllProfileNames: () =>
        this.profileManager.getAllProfileNamesAsync(),
      layout_executeLayoutManagerCommands: (commands) =>
        this.layoutManager.executeCommands(commands),
      // layout_getAllProjectLayoutsInfos: () =>
      //   this.layoutManager.getAllProjectLayoutsInfos(),
      layout_showEditLayoutFileInFiler: async () =>
        this.layoutManager.showEditLayoutFileInFiler(),
      projects_loadKeyboardShape: (origin, projectId, layoutName) =>
        projectResourceProvider.loadProjectLayout(
          origin,
          projectId,
          layoutName,
        ),
      device_connectToDevice: async (path) =>
        this.deviceService.selectTargetDevice(path),
      device_setCustomParameterValue: async (index, value) =>
        this.deviceService.setCustomParameterValue(index, value),
      firmup_uploadFirmware: (origin, projectId, variationName) =>
        this.firmwareUpdationService.writeFirmware(
          origin,
          projectId,
          variationName,
        ),
      projects_getAllProjectResourceInfos: () =>
        projectResourceProvider.getAllProjectResourceInfos(),
      projects_getProjectCustomDefinition: (origin, projectId) =>
        projectResourceProvider.getProjectCustomDefinition(origin, projectId),
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
        const profile = await this.profileManager.getCurrentProfileAsync();
        const layoutStandard = this.keyboardConfigProvider.getKeyboardConfig()
          .layoutStandard;
        if (profile) {
          return await this.deviceService.emitKeyAssignsToDevice(
            profile,
            layoutStandard,
          );
        }
        return false;
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
      global_triggerLazyInitializeServices: async () =>
        this.lazyInitialzeServices(),
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
      layout_layoutManagerStatus: (listener) =>
        this.layoutManager.statusEvents.subscribe(listener),
      device_deviceSelectionEvents: (cb) =>
        this.deviceService.selectionStatusEventPort.subscribe(cb),
      device_keyEvents: (cb) => {
        this.deviceService.realtimeEventPort.subscribe(cb);
        return () => this.deviceService.realtimeEventPort.unsubscribe(cb);
      },
      device_keyboardDeviceStatusEvents: (cb) => {
        this.deviceService.statusEventPort.subscribe(cb);
        return () => this.deviceService.statusEventPort.unsubscribe(cb);
      },
      firmup_deviceDetectionEvents: (cb) =>
        this.firmwareUpdationService.deviceDetectionEvents.subscribe(cb),
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
  lazyInitialzeServices() {
    if (!this._lazyInitializeTriggered) {
      this._lazyInitializeTriggered = true;
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
      await applicationStorage.terminateAsync();
    });
  }
}
