/* eslint-disable @typescript-eslint/require-await */
import { shell } from 'electron';
import { getAppErrorData, IPresetSpec, makeCompactStackTrace } from '~/shared';
import { appConfig, appEnv, appGlobal, applicationStorage } from '~/shell/base';
import { executeWithFatalErrorHandler } from '~/shell/base/ErrorChecker';
import { pathResolve } from '~/shell/funcs';
import { projectResourceProvider } from '~/shell/projectResources';
import { checkLocalRepositoryFolder } from '~/shell/projectResources/LocalResourceHelper';
import { globalSettingsProvider } from '~/shell/services/config/GlobalSettingsProvider';
import { KeyboardConfigProvider } from '~/shell/services/config/KeyboardConfigProvider';
import { KeyboardDeviceService } from '~/shell/services/device/keyboardDevice';
import { JsonFileServiceStatic } from '~/shell/services/file/JsonFileServiceStatic';
import { FirmwareUpdationService } from '~/shell/services/firmwareUpdation';
import { InputLogicSimulatorD } from '~/shell/services/keyboardLogic/inputLogicSimulatorD';
import { KeyboardLayoutFilesWatcher } from '~/shell/services/layout/KeyboardLayoutFilesWatcher';
import { LayoutManager } from '~/shell/services/layout/LayoutManager';
import { PresetProfileLoader } from '~/shell/services/profile/PresetProfileLoader';
import { ProfileManager } from '~/shell/services/profile/ProfileManager';
import { UserPresetHubService } from '~/shell/services/userPresetHub/UserPresetHubService';
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

  private presetHubService = new UserPresetHubService();

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
      system_getApplicationVersionInfo: async () => ({
        version: appConfig.applicationVersion,
      }),
      window_closeWindow: async () => windowWrapper.closeMainWindow(),
      window_minimizeWindow: async () => windowWrapper.minimizeMainWindow(),
      window_maximizeWindow: async () => windowWrapper.maximizeMainWindow(),
      window_restartApplication: async () => windowWrapper.restartApplication(),
      window_reloadPage: async () => windowWrapper.reloadPage(),
      window_setDevToolVisibility: async (visible) =>
        windowWrapper.setDevToolsVisibility(visible),
      window_setWidgetAlwaysOnTop: async (enabled) =>
        windowWrapper.setWidgetAlwaysOnTop(enabled),
      profile_getCurrentProfile: () =>
        this.profileManager.getCurrentProfileAsync(),
      profile_executeProfileManagerCommands: (commands) =>
        this.profileManager.executeCommands(commands),
      profile_getAllProfileEntries: () =>
        this.profileManager.getAllProfileEntriesAsync(),
      profile_openUserProfilesFolder: () =>
        this.profileManager.openUserProfilesFolder(),
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
      device_resetParaemters: async () => this.deviceService.resetParameters(),
      firmup_uploadFirmware: (origin, projectId, variationName) =>
        this.firmwareUpdationService.writeFirmware(
          origin,
          projectId,
          variationName,
        ),
      projects_getAllProjectResourceInfos: () =>
        projectResourceProvider.getAllProjectResourceInfos(),
      projects_getProjectCustomDefinition: (origin, projectId, variationName) =>
        projectResourceProvider.getProjectCustomDefinition(
          origin,
          projectId,
          variationName,
        ),
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
      presetHub_getServerProjectIds: () =>
        this.presetHubService.getServerProjectIds(),
      presetHub_getServerProfiles: (projectId: string) =>
        this.presetHubService.getServerProfiles(projectId),
      config_writeKeyboardConfig: async (config) =>
        this.keyboardConfigProvider.writeKeyboardConfig(config),
      config_writeKeyMappingToDevice: async () => {
        const profile = await this.profileManager.getCurrentProfileAsync();
        if (profile) {
          return await this.deviceService.emitKeyAssignsToDevice(profile);
        }
        return false;
      },
      config_getGlobalSettings: async () =>
        globalSettingsProvider.getGlobalSettings(),
      config_writeGlobalSettings: async (settings) =>
        globalSettingsProvider.writeGlobalSettings(settings),
      config_getProjectRootDirectoryPath: async () => {
        if (appEnv.isDevelopment) {
          return pathResolve('..');
        } else {
          const settings = globalSettingsProvider.getGlobalSettings();
          return settings.localProjectRootFolderPath;
        }
      },
      config_checkLocalRepositoryFolderPath: async (path) =>
        checkLocalRepositoryFolder(path),
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

      platform_openUrlInDefaultBrowser: (path) => shell.openExternal(path),
      global_triggerLazyInitializeServices: async () =>
        this.lazyInitialzeServices(),

      simulator_postSimulationTargetProfile: async (profile) =>
        this.inputLogicSimulator.postSimulationTargetProfile(profile),
    });

    appGlobal.icpMainAgent.supplySubscriptionHandlers({
      dev_testEvent: (cb) => {
        // eslint-disable-next-line node/no-callback-literal
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

      config_keyboardConfigEvents: (cb) =>
        this.keyboardConfigProvider.keyboardConfigEventPort.subscribe(cb),
      config_globalSettingsEvents: (cb) =>
        globalSettingsProvider.globalConfigEventPort.subscribe(cb),
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
