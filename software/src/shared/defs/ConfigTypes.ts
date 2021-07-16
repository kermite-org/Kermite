import {
  vBoolean,
  vObject,
  vString,
} from '~/shared/modules/SchemaValidationHelper';

export interface IKeyboardConfig {
  isSimulatorMode: boolean;
  isMuteMode: boolean;
}

export const fallbackKeyboardConfig: IKeyboardConfig = {
  isSimulatorMode: false,
  isMuteMode: false,
};

export interface IGlobalSettings {
  useOnlineResources: boolean;
  useLocalResouces: boolean;
  localProjectRootFolderPath: string;
  allowCrossKeyboardKeyMappingWrite: boolean;
}

export const globalSettingsLoadingSchema = vObject({
  useOnlineResources: vBoolean(),
  useLocalResouces: vBoolean(),
  localProjectRootFolderPath: vString(),
  allowCrossKeyboardKeyMappingWrite: vBoolean().optional,
});

export const globalSettingsDefault: IGlobalSettings = {
  useOnlineResources: true,
  useLocalResouces: false,
  localProjectRootFolderPath: '',
  allowCrossKeyboardKeyMappingWrite: false,
};
