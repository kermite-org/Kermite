import { IAppErrorData } from '~/shared/defs/CustomErrors';
import {
  IApplicationVersionInfo,
  IAppWindowStatus,
  IBootloaderDeviceDetectionStatus,
  ICustomFirmwareInfo,
  ILayoutManagerCommand,
  ILayoutManagerStatus,
  IProfileEntry,
  IProfileManagerCommand,
  IProfileManagerStatus,
  IProjectPackageInfo,
  IRealtimeKeyboardEvent,
  IResourceOrigin,
  IServerProfileInfo,
} from '~/shared/defs/DomainTypes';
import { ICoreAction, ICoreState } from '~/shared/defs/GlobalStateActionTypes';
import { IGlobalSettings } from './ConfigTypes';
import { IProfileData } from './ProfileData';

export interface IAppIpcContract {
  sync: {
    dev_debugMessage(message: string): void;
    // config_saveSettingsOnClosing?: IApplicationSettings;
  };
  async: {
    system_getApplicationVersionInfo(): Promise<IApplicationVersionInfo>;
    window_closeWindow(): Promise<void>;
    window_minimizeWindow(): Promise<void>;
    window_maximizeWindow(): Promise<void>;
    window_restartApplication(): Promise<void>;
    window_setDevToolVisibility(visible: boolean): Promise<void>;
    window_setWidgetAlwaysOnTop(enabled: boolean): Promise<void>;
    window_reloadPage(): Promise<void>;

    profile_getCurrentProfile(): Promise<IProfileData | undefined>;
    profile_getAllProfileEntries(): Promise<IProfileEntry[]>;
    profile_executeProfileManagerCommands(
      commands: IProfileManagerCommand[],
    ): Promise<void>;
    profile_openUserProfilesFolder(): Promise<void>;

    layout_executeLayoutManagerCommands(
      commands: ILayoutManagerCommand[],
    ): Promise<boolean>;

    layout_showEditLayoutFileInFiler(): Promise<void>;
    // layout_getAllProjectLayoutsInfos(): Promise<IProjectLayoutsInfo[]>;

    config_writeKeyMappingToDevice(): Promise<boolean>;

    config_getGlobalSettings(): Promise<IGlobalSettings>;

    config_getProjectRootDirectoryPath(): Promise<string>;
    config_checkLocalRepositoryFolderPath(path: string): Promise<boolean>;

    projects_getAllProjectPackageInfos(): Promise<IProjectPackageInfo[]>;
    projects_saveLocalProjectPackageInfo(
      info: IProjectPackageInfo,
    ): Promise<void>;
    projects_getAllCustomFirmwareInfos(): Promise<ICustomFirmwareInfo[]>;

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
      variationName: string,
    ): Promise<string>;

    file_getOpenJsonFilePathWithDialog(): Promise<string | undefined>;
    file_getSaveJsonFilePathWithDialog(): Promise<string | undefined>;
    file_loadObjectFromJsonWithFileDialog(): Promise<any | undefined>;
    file_saveObjectToJsonWithFileDialog(obj: any): Promise<boolean>;
    file_getOpenDirectoryWithDialog(): Promise<string | undefined>;

    simulator_postSimulationTargetProfile(profile: IProfileData): Promise<void>;

    platform_openUrlInDefaultBrowser(path: string): Promise<void>;

    global_triggerLazyInitializeServices(): Promise<void>;

    global_dispatchCoreAction(action: ICoreAction): Promise<void>;
  };
  events: {
    dev_testEvent: { type: string };
    global_appErrorEvents: IAppErrorData<any>;
    window_appWindowStatus: Partial<IAppWindowStatus>;
    profile_profileManagerStatus: Partial<IProfileManagerStatus>;
    layout_layoutManagerStatus: Partial<ILayoutManagerStatus>;
    device_keyEvents: IRealtimeKeyboardEvent;
    firmup_deviceDetectionEvents: IBootloaderDeviceDetectionStatus;
    global_coreStateEvents: Partial<ICoreState>;
  };
}
