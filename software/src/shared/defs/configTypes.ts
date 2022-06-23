import { IResourceOrigin } from '~/shared/defs/domainTypes';
import {
  vBoolean,
  vObject,
  vString,
} from '~/shared/loaders/schemaValidationHelper';

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

export interface IGlobalProjectSpec {
  origin: IResourceOrigin;
  projectId: string;
}
export interface IGlobalSettings {
  useLocalResources: boolean;
  localProjectRootFolderPath: string;
  allowCrossKeyboardKeyMappingWrite: boolean;
  globalProjectSpec: IGlobalProjectSpec | undefined;
  developerMode: boolean;
  showDevelopmentPackages: boolean;
}

export const globalSettingsLoadingSchema = vObject({
  useLocalResources: vBoolean(),
  localProjectRootFolderPath: vString(),
  allowCrossKeyboardKeyMappingWrite: vBoolean().optional,
  globalProjectSpec: vObject({
    origin: vString(),
    projectId: vString(),
  }).optional,
  developerMode: vBoolean().optional,
});

export const globalSettingsDefault: IGlobalSettings = {
  useLocalResources: false,
  localProjectRootFolderPath: '',
  allowCrossKeyboardKeyMappingWrite: false,
  globalProjectSpec: undefined,
  developerMode: false,
  showDevelopmentPackages: false,
};

export const globalSettingsFallbackValue: IGlobalSettings = {
  useLocalResources: false,
  localProjectRootFolderPath: '',
  allowCrossKeyboardKeyMappingWrite: false,
  globalProjectSpec: undefined,
  developerMode: false,
  showDevelopmentPackages: false,
};
