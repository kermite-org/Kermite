/* eslint-disable @typescript-eslint/require-await */
import { shell } from 'electron';
import { getAppErrorData, makeCompactStackTrace } from '~/shared';
import { appConfig, appEnv, appGlobal, applicationStorage } from '~/shell/base';
import { executeWithFatalErrorHandler } from '~/shell/base/ErrorChecker';
import { pathResolve } from '~/shell/funcs';
import {
  coreActionDistributor,
  coreState,
  coreStateManager,
  dispatchCoreAction,
} from '~/shell/global';
import {
  developmentModule_ActionReceiver,
  keyboardConfigModule,
  projectPackageModule,
} from '~/shell/modules';
import { globalSettingsModule } from '~/shell/modules/GlobalSettingsModule';
import { checkLocalRepositoryFolder } from '~/shell/projectResources/LocalResourceHelper';
import { KeyboardDeviceService } from '~/shell/services/device/keyboardDevice';
import { JsonFileServiceStatic } from '~/shell/services/file/JsonFileServiceStatic';
import { FirmwareUpdationService } from '~/shell/services/firmwareUpdation';
import { InputLogicSimulatorD } from '~/shell/services/keyboardLogic/inputLogicSimulatorD';
import { LayoutManager } from '~/shell/services/layout/LayoutManager';
import { ProfileManager } from '~/shell/services/profile/ProfileManager';
import { UserPresetHubService } from '~/shell/services/userPresetHub/UserPresetHubService';
import { AppWindowWrapper } from '~/shell/services/window';

export class ApplicationRoot {
  private firmwareUpdationService = new FirmwareUpdationService();

  private deviceService = new KeyboardDeviceService();

  private profileManager = new ProfileManager();

  private layoutManager = new LayoutManager(this.profileManager);

  private inputLogicSimulator = new InputLogicSimulatorD(
    this.profileManager,
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
      profile_getCurrentProfile: async () =>
        this.profileManager.getCurrentProfile(),
      profile_executeProfileManagerCommands: (commands) =>
        this.profileManager.executeCommands(commands),
      profile_getAllProfileEntries: async () =>
        this.profileManager.getAllProfileEntries(),
      profile_openUserProfilesFolder: () =>
        this.profileManager.openUserProfilesFolder(),
      layout_executeLayoutManagerCommands: (commands) =>
        this.layoutManager.executeCommands(commands),
      layout_showEditLayoutFileInFiler: async () =>
        this.layoutManager.showEditLayoutFileInFiler(),
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
      projects_getAllProjectPackageInfos: async () =>
        coreState.allProjectPackageInfos,
      projects_saveLocalProjectPackageInfo: (projectInfo) =>
        dispatchCoreAction({ saveLocalProjectPackageInfo: { projectInfo } }),
      projects_getAllCustomFirmwareInfos: async () =>
        coreState.allCustomFirmwareInfos,
      presetHub_getServerProjectIds: () =>
        this.presetHubService.getServerProjectIds(),
      presetHub_getServerProfiles: (projectId: string) =>
        this.presetHubService.getServerProfiles(projectId),
      config_writeKeyMappingToDevice: async () => {
        const profile = this.profileManager.getCurrentProfile();
        if (profile) {
          return await this.deviceService.emitKeyAssignsToDevice(profile);
        }
        return false;
      },
      config_getGlobalSettings: async () => coreState.globalSettings,
      config_getProjectRootDirectoryPath: async () => {
        if (appEnv.isDevelopment) {
          return pathResolve('..');
        } else {
          return coreState.globalSettings.localProjectRootFolderPath;
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

      global_dispatchCoreAction: async (action) =>
        await dispatchCoreAction(action),
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
      firmup_deviceDetectionEvents: (cb) =>
        this.firmwareUpdationService.deviceDetectionEvents.subscribe(cb),
      window_appWindowStatus: windowWrapper.appWindowEventPort.subscribe,
      global_coreStateEvents: (cb) =>
        coreStateManager.coreStateEventPort.subscribe(cb),
    });
  }

  private async setupActionReceivers() {
    coreActionDistributor.addReceivers(
      globalSettingsModule,
      developmentModule_ActionReceiver,
      projectPackageModule,
      keyboardConfigModule,
    );
    globalSettingsModule.loadGlobalSettings!(1);
    keyboardConfigModule.loadKeyboardConfig!(1);
    await dispatchCoreAction({ loadAllProjectPackages: 1 });
    await dispatchCoreAction({ loadAllCustomFirmwareInfos: 1 });
  }

  async initialize() {
    await executeWithFatalErrorHandler(async () => {
      console.log(`initialize services`);
      await applicationStorage.initializeAsync();
      await this.setupActionReceivers();
      await this.profileManager.initializeAsync();
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
      this.profileManager.terminate();
      await applicationStorage.terminateAsync();
    });
  }
}
