/* eslint-disable @typescript-eslint/require-await */
import { memoryFileSystem } from '~/memoryFileSystem';
import { getAppErrorData, ICoreState, makeCompactStackTrace } from '~/shared';
import { appConfig, appEnv, appGlobal, applicationStorage } from '~/shell/base';
import {
  executeWithFatalErrorHandlerSync,
  reportShellError,
} from '~/shell/base/errorChecker';
import { pathResolve } from '~/shell/funcs';
import { fileDialogLoaders } from '~/shell/loaders/fileDialogLoaders';
import { checkLocalRepositoryFolder } from '~/shell/loaders/localResourceHelper';
import { userPresetHubDataLoader } from '~/shell/loaders/userPresetHubDataLoader';
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
import { layoutManagerModule } from '~/shell/modules/layout/layoutManagerModule';
import { profileManagerModule } from '~/shell/modules/profile/profileManagerModule';
import { profileManagerRoot } from '~/shell/modules/profile/profileManagerRoot';
import { globalSettingsModule } from '~/shell/modules/setting/globalSettingsModule';
import { FirmwareUpdateService } from '~/shell/services/firmwareUpdate';
import { KeyboardDeviceService } from '~/shell/services/keyboardDevice';
import { InputLogicSimulator } from '~/shell/services/keyboardLogic';
import { createWindowModule } from './services/window/appWindowWrapper';

export class ApplicationRoot {
  private firmwareUpdateService = new FirmwareUpdateService();

  private deviceService = new KeyboardDeviceService();

  private inputLogicSimulator = new InputLogicSimulator(this.deviceService);

  // private windowWrapper = new AppWindowWrapper();

  // ------------------------------------------------------------

  private setupIpcBackend() {
    appGlobal.ipcMainAgent.setErrorHandler((error) => {
      console.error(makeCompactStackTrace(error));
      appGlobal.appErrorEventPort.emit(
        getAppErrorData(error, appEnv.resolveApplicationRootDir()),
      );
    });

    appGlobal.ipcMainAgent.supplySyncHandlers({
      dev_debugMessage: (msg) => console.log(`[renderer] ${msg}`),
    });

    appGlobal.ipcMainAgent.supplyAsyncHandlers({
      profile_getCurrentProfile: async () => profilesReader.getCurrentProfile(),
      device_connectToDevice: (path) =>
        this.deviceService.selectTargetDevice(path),
      device_selectHidDevice: () => this.deviceService.selectHidDevice(),
      device_setCustomParameterValue: async (index, value) =>
        this.deviceService.setCustomParameterValue(index, value),
      device_resetParameters: async () => this.deviceService.resetParameters(),
      firmup_uploadFirmware: async (
        origin,
        projectId,
        variationId,
        firmwareOrigin,
      ) =>
        this.firmwareUpdateService.writeFirmware(
          origin,
          projectId,
          variationId,
          firmwareOrigin,
        ),
      firmup_writeStandardFirmwareDirect: async (packageInfo, variationId) =>
        this.firmwareUpdateService.writeStandardFirmwareDirect(
          packageInfo,
          variationId,
        ),
      firmup_downloadFirmwareUf2File: (
        origin,
        projectId,
        variationId,
        firmwareOrigin,
      ) =>
        this.firmwareUpdateService.downloadFirmwareUf2File(
          origin,
          projectId,
          variationId,
          firmwareOrigin,
        ),
      firmup_downloadFirmwareUf2FileFromPackage: (packageInfo, variationId) =>
        this.firmwareUpdateService.downloadFirmwareUf2FileFromPackage(
          packageInfo,
          variationId,
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
      file_saveObjectToJsonWithFileDialog: async (obj) =>
        fileDialogLoaders.saveObjectToJsonWithFileDialog(obj),
      file_getOpenDirectoryWithDialog:
        fileDialogLoaders.getOpeningDirectoryPathWithDialog,
      file_loadJsonFileContent: fileDialogLoaders.loadJsonFileContent,

      platform_openUrlInDefaultBrowser: (_path) => {
        // shell.openExternal(path)
        throw new Error('obsolete function invoked');
      },
      global_lazyInitializeServices: () => this.lazyInitializeServices(),

      global_dispatchCoreAction: async (action) =>
        await dispatchCoreAction(action),
    });

    appGlobal.ipcMainAgent.supplySubscriptionHandlers({
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

  onCoreStateChange = async (diff: Partial<ICoreState>) => {
    if (diff.globalSettings) {
      await dispatchCoreAction({ project_loadAllCustomFirmwareInfos: 1 }).catch(
        reportShellError,
      );
    }
  };

  initialize() {
    executeWithFatalErrorHandlerSync(() => {
      memoryFileSystem.initialize();
      console.log(`initialize services`);
      applicationStorage.initialize();
      this.setupIpcBackend();
      // this.windowWrapper.initialize();
    });
  }

  private _lazyInitializeTriggered = false;

  async lazyInitializeServices() {
    if (!this._lazyInitializeTriggered) {
      this._lazyInitializeTriggered = true;
      const windowModule = createWindowModule();
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
      const kermiteServerProjectIds =
        await userPresetHubDataLoader.getServerProjectIds();
      commitCoreState({ kermiteServerProjectIds });
      try {
        profileManagerRoot.initialize();
      } catch (err) {
        reportShellError(err);
      }
      layoutManagerRoot.initialize();
      coreStateManager.coreStateEventPort.subscribe(this.onCoreStateChange);
      await this.deviceService.initialize();
      this.inputLogicSimulator.initialize();
      commitCoreState({
        applicationVersionInfo: {
          version: appConfig.applicationVersion,
        },
      });
    }
  }

  async disposeConnectedHidDevice() {
    await this.deviceService.disposeConnectedHidDevice();
  }

  terminate() {
    executeWithFatalErrorHandlerSync(() => {
      console.log(`terminate services`);
      this.inputLogicSimulator.terminate();
      this.deviceService.terminate();
      // this.windowWrapper.terminate();
      profileManagerRoot.terminate();
      layoutManagerRoot.terminate();
      coreStateManager.coreStateEventPort.unsubscribe(this.onCoreStateChange);
      applicationStorage.terminate();
      memoryFileSystem.terminate();
    });
    this.disposeConnectedHidDevice();
  }
}
