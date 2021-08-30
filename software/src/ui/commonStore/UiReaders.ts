import {
  createProjectSig,
  ICustomFirmwareInfo,
  IGlobalSettings,
  IKeyboardConfig,
  IKeyboardDeviceStatus,
  IProjectPackageInfo,
} from '~/shared';
import { router } from '~/ui/base';
import { PagePaths } from '~/ui/commonModels/PageTypes';
import { uiState } from '~/ui/commonStore/base';

export const uiReaders = {
  get globalSettings(): IGlobalSettings {
    return uiState.core.globalSettings;
  },
  get allProjectPackageInfos(): IProjectPackageInfo[] {
    return uiState.core.allProjectPackageInfos;
  },
  get allCustomFirmwareInfos(): ICustomFirmwareInfo[] {
    return uiState.core.allCustomFirmwareInfos;
  },
  get deviceStatus(): IKeyboardDeviceStatus {
    return uiState.core.deviceStatus;
  },
  get isDeviceConnected() {
    return uiState.core.deviceStatus.isConnected;
  },
  get keyboardConfig(): IKeyboardConfig {
    return uiState.core.keyboardConfig;
  },
  get pagePath() {
    return router.getPagePath() as PagePaths;
  },
  get isGlobalProjectSelected() {
    return !!uiState.core.globalSettings.globalProjectSpec;
  },
  get globalProjectId() {
    return uiState.core.globalSettings.globalProjectSpec?.projectId;
  },
  get globalProjectOrigin() {
    return uiState.core.globalSettings.globalProjectSpec?.origin;
  },
  get globalProjectKey(): string {
    const { globalProjectSpec: spec } = uiState.core.globalSettings;
    return (spec && createProjectSig(spec.origin, spec.projectId)) || '';
  },
  get isDeveloperMode() {
    return uiState.core.globalSettings.developerMode;
  },
  get isLocalProjectSelectedForEdit(): boolean {
    const { developerMode, globalProjectSpec } = uiState.core.globalSettings;
    return developerMode && globalProjectSpec?.origin === 'local';
  },
};
