import { IAppErrorData } from '~/shared/defs/customErrors';
import {
  IBootloaderDeviceDetectionStatus,
  IFirmwareOriginEx,
  IProjectPackageInfo,
  IRealtimeKeyboardEvent,
  IResourceOrigin,
  IServerProfileInfo,
} from '~/shared/defs/domainTypes';
import { ICoreAction, ICoreState } from '~/shared/defs/globalStateActionTypes';
import { IFileReadHandle, IFileWriteHandle } from './infrastructureTypes';
import { IProfileData } from './profileData';

export interface IAppIpcContract {
  sync: {
    dev_debugMessage(message: string): void;
    // config_saveSettingsOnClosing?: IApplicationSettings;
  };
  async: {
    profile_getCurrentProfile(): Promise<IProfileData | undefined>;
    config_writeKeyMappingToDevice(): Promise<boolean>;
    config_getProjectRootDirectoryPath(): Promise<string>;
    config_checkLocalRepositoryFolderPath(path: string): Promise<boolean>;

    presetHub_getServerProjectIds(): Promise<string[]>;
    presetHub_getServerProfiles(
      projectId: string,
    ): Promise<IServerProfileInfo[]>;

    device_connectToDevice(path: string): Promise<void>;
    device_setCustomParameterValue(index: number, value: number): Promise<void>;
    device_resetParameters(): Promise<void>;
    device_requestAddNewHidDevice(): Promise<void>;

    firmup_uploadFirmware(
      origin: IResourceOrigin,
      projectId: string,
      variationId: string,
      firmwareOrigin: IFirmwareOriginEx,
    ): Promise<string>;

    firmup_writeStandardFirmwareDirect(
      packageInfo: IProjectPackageInfo,
      variationId: string,
    ): Promise<string>;

    firmup_downloadFirmwareUf2File(
      origin: IResourceOrigin,
      projectId: string,
      variationId: string,
      firmwareOrigin: IFirmwareOriginEx,
    ): Promise<void>;

    firmup_downloadFirmwareUf2FileFromPackage(
      packageInfo: IProjectPackageInfo,
      variationId: string,
    ): Promise<void>;

    file_getOpenJsonFilePathWithDialog(
      extension: string,
    ): Promise<IFileReadHandle | undefined>;
    file_getSaveJsonFilePathWithDialog(
      extension: string,
      defaultName: string,
    ): Promise<IFileWriteHandle | undefined>;
    file_loadObjectFromJsonWithFileDialog(
      extension: string,
    ): Promise<any | undefined>;
    file_saveObjectToJsonWithFileDialog(
      extension: string,
      defaultName: string,
      obj: any,
    ): Promise<boolean>;
    file_getOpenDirectoryWithDialog(): Promise<string | undefined>;
    file_loadJsonFileContent(fileHandle: IFileReadHandle): Promise<any>;

    platform_openUrlInDefaultBrowser(path: string): Promise<void>;

    global_lazyInitializeServices(): Promise<void>;
    global_dispatchCoreAction(action: ICoreAction): Promise<void>;
  };
  events: {
    global_appErrorEvents: IAppErrorData<any>;
    device_keyEvents: IRealtimeKeyboardEvent;
    firmup_deviceDetectionEvents: IBootloaderDeviceDetectionStatus;
    global_coreStateEvents: Partial<ICoreState>;
  };
}
