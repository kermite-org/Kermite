import { IAppErrorData } from '~/shared/defs/CustomErrors';
import {
  IBootloaderDeviceDetectionStatus,
  IFirmwareOriginEx,
  IProjectPackageInfo,
  IRealtimeKeyboardEvent,
  IResourceOrigin,
  IServerProfileInfo,
} from '~/shared/defs/DomainTypes';
import { ICoreAction, ICoreState } from '~/shared/defs/GlobalStateActionTypes';
import { IProfileData } from './ProfileData';

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

    file_getOpenJsonFilePathWithDialog(): Promise<string | undefined>;
    file_getSaveJsonFilePathWithDialog(): Promise<string | undefined>;
    file_loadObjectFromJsonWithFileDialog(): Promise<any | undefined>;
    file_saveObjectToJsonWithFileDialog(obj: any): Promise<boolean>;
    file_getOpenDirectoryWithDialog(): Promise<string | undefined>;
    file_loadJsonFileContent(filePath: string): Promise<any>;

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
