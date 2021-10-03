/* eslint-disable @typescript-eslint/require-await */
import { shell } from 'electron';
import { getAppErrorData, makeCompactStackTrace } from '~/shared';
import { appConfig, appEnv, appGlobal, applicationStorage } from '~/shell/base';
import {
  executeWithFatalErrorHandler,
  reportShellError,
} from '~/shell/base/ErrorChecker';
import { pathResolve } from '~/shell/funcs';
import { fileDialogLoaders } from '~/shell/loaders/FileDialogLoaders';
import { checkLocalRepositoryFolder } from '~/shell/loaders/LocalResourceHelper';
import { userPresetHubDataLoader } from '~/shell/loaders/UserPresetHubDataLoader';
import {
  keyboardConfigModule,
  layoutManagerRoot,
  projectPackageModule,
} from '~/shell/modules';
import {
  commitCoreState,
  coreActionDistributor,
  coreState,
  coreStateManager,
  dispatchCoreAction,
  profilesReader,
} from '~/shell/modules/core';
import { layoutManagerModule } from '~/shell/modules/layout/LayoutManagerModule';
import { profileManagerModule } from '~/shell/modules/profile/ProfileManagerModule';
import { profileManagerRoot } from '~/shell/modules/profile/ProfileManagerRoot';
import { globalSettingsModule } from '~/shell/modules/setting/GlobalSettingsModule';
import { FirmwareUpdateService } from '~/shell/services/firmwareUpdate';
import { KeyboardDeviceService } from '~/shell/services/keyboardDevice';
import { InputLogicSimulator } from '~/shell/services/keyboardLogic';
import { AppWindowWrapper, createWindowModule } from '~/shell/services/window';

export class ApplicationRoot {
  private firmwareUpdateService = new FirmwareUpdateService();

  private deviceService = new KeyboardDeviceService();

  private inputLogicSimulator = new InputLogicSimulator(this.deviceService);

  private windowWrapper = new AppWindowWrapper();

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
      profile_getCurrentProfile: async () => profilesReader.getCurrentProfile(),
      device_connectToDevice: async (path) =>
        this.deviceService.selectTargetDevice(path),
      device_setCustomParameterValue: async (index, value) =>
        this.deviceService.setCustomParameterValue(index, value),
      device_resetParameters: async () => this.deviceService.resetParameters(),
      firmup_uploadFirmware: (origin, projectId, firmwareName) =>
        this.firmwareUpdateService.writeFirmware(
          origin,
          projectId,
          firmwareName,
        ),
      presetHub_getServerProjectIds: () =>
        userPresetHubDataLoader.getServerProjectIds(),
      presetHub_getServerProfiles: (projectId: string) =>
        userPresetHubDataLoader.getServerProfiles(projectId),
      config_writeKeyMappingToDevice: async () => {
        const profile = profilesReader.getCurrentProfile();
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
        fileDialogLoaders.getOpeningJsonFilePathWithDialog,
      file_getSaveJsonFilePathWithDialog:
        fileDialogLoaders.getSavingJsonFilePathWithDialog,
      file_loadObjectFromJsonWithFileDialog:
        fileDialogLoaders.loadObjectFromJsonWithFileDialog,
      file_saveObjectToJsonWithFileDialog:
        fileDialogLoaders.saveObjectToJsonWithFileDialog,
      file_getOpenDirectoryWithDialog:
        fileDialogLoaders.getOpeningDirectoryPathWithDialog,

      platform_openUrlInDefaultBrowser: (path) => shell.openExternal(path),
      global_lazyInitializeServices: () => this.lazyInitializeServices(),

      global_dispatchCoreAction: async (action) =>
        await dispatchCoreAction(action),
    });

    appGlobal.icpMainAgent.supplySubscriptionHandlers({
      global_appErrorEvents: (cb) => appGlobal.appErrorEventPort.subscribe(cb),
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
        profileManagerModule,
        layoutManagerModule,
      );
      globalSettingsModule.config_loadGlobalSettings(1);
      keyboardConfigModule.config_loadKeyboardConfig(1);
      await dispatchCoreAction({ project_loadAllProjectPackages: 1 }).catch(
        reportShellError,
      );
      await dispatchCoreAction({ project_loadAllCustomFirmwareInfos: 1 }).catch(
        reportShellError,
      );
      await profileManagerRoot.initializeAsync();
      await layoutManagerRoot.initializeAsync();
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
      profileManagerRoot.terminate();
      layoutManagerRoot.terminate();
      await applicationStorage.terminateAsync();
    });
  }
}
