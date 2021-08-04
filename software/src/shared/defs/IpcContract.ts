import { IAppErrorData } from '~/shared/defs/CustomErrors';
import {
  IApplicationVersionInfo,
  IProfileManagerCommand,
  ILayoutManagerCommand,
  IProjectResourceInfo,
  IResourceOrigin,
  IProjectCustomDefinition,
  IPresetSpec,
  IServerPorfileInfo,
  IAppWindowStatus,
  IProfileManagerStatus,
  ILayoutManagerStatus,
  IDeviceSelectionStatus,
  IRealtimeKeyboardEvent,
  IKeyboardDeviceStatus,
  IBootloaderDeviceDetectionStatus,
  IProfileEntry,
} from '~/shared/defs/DomainTypes';
import { IPersistKeyboardDesign } from '~/shared/defs/KeyboardDesign';
import { IGlobalSettings, IKeyboardConfig } from './ConfigTypes';
import { IProfileData } from './ProfileData';

export interface IAppIpcContract {
  sync: {
    dev_debugMessage(message: string): void;
    // config_saveSettingsOnClosing?: IApplicationSettings;
    config_saveKeyboardConfigOnClosing(data: IKeyboardConfig): void;
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

    config_writeKeyboardConfig(config: Partial<IKeyboardConfig>): Promise<void>;
    config_writeKeyMappingToDevice(): Promise<boolean>;

    config_getGlobalSettings(): Promise<IGlobalSettings>;
    config_writeGlobalSettings(
      settings: Partial<IGlobalSettings>,
    ): Promise<void>;

    config_getProjectRootDirectoryPath(): Promise<string>;
    config_checkLocalRepositoryFolderPath(path: string): Promise<boolean>;

    projects_getAllProjectResourceInfos(): Promise<IProjectResourceInfo[]>;
    projects_getProjectCustomDefinition(
      origin: IResourceOrigin,
      projectId: string,
      variationName: string,
    ): Promise<IProjectCustomDefinition | undefined>;
    projects_loadPresetProfile(
      origin: IResourceOrigin,
      projectId: string,
      presetSpec: IPresetSpec,
    ): Promise<IProfileData | undefined>;
    projects_loadKeyboardShape(
      origin: IResourceOrigin,
      projectId: string,
      layoutName: string,
    ): Promise<IPersistKeyboardDesign | undefined>;

    presetHub_getServerProjectIds(): Promise<string[]>;
    presetHub_getServerProfiles(
      projectId: string,
    ): Promise<IServerPorfileInfo[]>;

    device_connectToDevice(path: string): Promise<void>;
    device_setCustomParameterValue(index: number, value: number): Promise<void>;
    device_resetParaemters(): Promise<void>;

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
  };
  events: {
    dev_testEvent: { type: string };
    global_appErrorEvents: IAppErrorData<any>;
    window_appWindowStatus: Partial<IAppWindowStatus>;
    profile_profileManagerStatus: Partial<IProfileManagerStatus>;
    layout_layoutManagerStatus: Partial<ILayoutManagerStatus>;

    device_deviceSelectionEvents: Partial<IDeviceSelectionStatus>;
    device_keyEvents: IRealtimeKeyboardEvent;
    device_keyboardDeviceStatusEvents: Partial<IKeyboardDeviceStatus>;

    firmup_deviceDetectionEvents: IBootloaderDeviceDetectionStatus;
    projects_layoutFileUpdationEvents: { projectId: string };

    config_keyboardConfigEvents: Partial<IKeyboardConfig>;
    config_globalSettingsEvents: Partial<IGlobalSettings>;
  };
}
