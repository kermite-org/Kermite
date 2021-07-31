import {
  vBoolean,
  vObject,
  vString,
} from '~/shared/modules/SchemaValidationHelper';

export interface IKeyboardConfig {
  isSimulatorMode: boolean;
  isMuteMode: boolean;
}

export const keyboardConfigLoadingDataSchema = vObject({
  isSimulatorMode: vBoolean(),
  isMuteMode: vBoolean(),
});

export const fallbackKeyboardConfig: IKeyboardConfig = {
  isSimulatorMode: false,
  isMuteMode: false,
};

export interface IGlobalSettings {
  useLocalResouces: boolean;
  localProjectRootFolderPath: string;
  allowCrossKeyboardKeyMappingWrite: boolean;
  globalProjectId: string;
}

export const globalSettingsLoadingSchema = vObject({
  useLocalResouces: vBoolean(),
  localProjectRootFolderPath: vString(),
  allowCrossKeyboardKeyMappingWrite: vBoolean().optional,
  globalProjectId: vString().optional,
});

export const globalSettingsDefault: IGlobalSettings = {
  useLocalResouces: false,
  localProjectRootFolderPath: '',
  allowCrossKeyboardKeyMappingWrite: false,
  globalProjectId: '',
};

export const globalSettingsFallbackValue: IGlobalSettings = {
  useLocalResouces: false,
  localProjectRootFolderPath: '',
  allowCrossKeyboardKeyMappingWrite: false,
  globalProjectId: '',
};
