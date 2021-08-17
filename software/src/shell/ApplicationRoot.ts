/* eslint-disable @typescript-eslint/require-await */
import { shell } from 'electron';
import { getAppErrorData, makeCompactStackTrace } from '~/shared';
import { appConfig, appEnv, appGlobal, applicationStorage } from '~/shell/base';
import { executeWithFatalErrorHandler } from '~/shell/base/ErrorChecker';
import { pathResolve } from '~/shell/funcs';
import {
  commitCoreState,
  coreActionDistributor,
  coreState,
  coreStateManager,
  dispatchCoreAction,
} from '~/shell/global';
import { keyboardConfigModule, projectPackageModule } from '~/shell/modules';
import { globalSettingsModule } from '~/shell/modules/GlobalSettingsModule';
import { checkLocalRepositoryFolder } from '~/shell/projectResources/LocalResourceHelper';
import { KeyboardDeviceService } from '~/shell/services/device/keyboardDevice';
import { JsonFileServiceStatic } from '~/shell/services/file/JsonFileServiceStatic';
import { FirmwareUpdateService } from '~/shell/services/firmwareUpdate';
import { InputLogicSimulatorD } from '~/shell/services/keyboardLogic/inputLogicSimulatorD';
import { LayoutManager } from '~/shell/services/layout/LayoutManager';
import { ProfileManager } from '~/shell/services/profile/ProfileManager';
import { UserPresetHubService } from '~/shell/services/userPresetHub/UserPresetHubService';
import { AppWindowWrapper, createWindowModule } from '~/shell/services/window';

export class ApplicationRoot {
  private firmwareUpdateService = new FirmwareUpdateService();

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
      device_resetParameters: async () => this.deviceService.resetParameters(),
      firmup_uploadFirmware: (origin, projectId, variationName) =>
        this.firmwareUpdateService.writeFirmware(
          origin,
          projectId,
          variationName,
        ),
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
      global_lazyInitializeServices: () => this.lazyInitializeServices(),

      simulator_postSimulationTargetProfile: async (profile) =>
        this.inputLogicSimulator.postSimulationTargetProfile(profile),

      global_dispatchCoreAction: async (action) =>
        await dispatchCoreAction(action),
    });

    appGlobal.icpMainAgent.supplySubscriptionHandlers({
      global_appErrorEvents: (cb) => appGlobal.appErrorEventPort.subscribe(cb),
      profile_profileManagerStatus: (cb) => {
        this.profileManager.statusEventPort.subscribe(cb);
        return () => this.profileManager.statusEventPort.unsubscribe(cb);
      },
      layout_layoutManagerStatus: (listener) =>
        this.layoutManager.statusEvents.subscribe(listener),
      device_keyEvents: (cb) => {
        this.deviceService.realtimeEventPort.subscribe(cb);
        return () => this.deviceService.realtimeEventPort.unsubscribe(cb);
      },
      firmup_deviceDetectionEvents: (cb) =>
        this.firmwareUpdateService.deviceDetectionEvents.subscribe(cb),
      global_coreStateEvents: (cb) =>
        coreStateManager.coreStateEventPort.subscribe(cb),
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

  async lazyInitializeServices() {
    if (!this._lazyInitializeTriggered) {
      this._lazyInitializeTriggered = true;
      const windowModule = createWindowModule(this.windowWrapper);
      coreActionDistributor.addReceivers(
        globalSettingsModule,
        projectPackageModule,
        keyboardConfigModule,
        windowModule,
      );
      globalSettingsModule.config_loadGlobalSettings!(1);
      keyboardConfigModule.config_loadKeyboardConfig!(1);
      await dispatchCoreAction({ project_loadAllProjectPackages: 1 });
      await dispatchCoreAction({ project_loadAllCustomFirmwareInfos: 1 });
      await this.profileManager.initializeAsync();
      this.deviceService.initialize();
      this.inputLogicSimulator.initialize();
      commitCoreState({
        applicationVersionInfo: {
          version: appConfig.applicationVersion,
        },
      });
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
