import {
  createProjectKey,
  ICustomFirmwareInfo,
  IGlobalSettings,
  IKeyboardConfig,
  IKeyboardDeviceStatus,
  IProjectPackageInfo,
} from '~/shared';
import { router } from '~/ui/base';
import { PagePaths } from '~/ui/commonModels/pageTypes';
import { uiState } from '~/ui/store/base/uiState';

export const uiReaders = {
  get globalSettings(): IGlobalSettings {
    return uiState.core.globalSettings;
  },
  get allProjectPackageInfos(): IProjectPackageInfo[] {
    return uiState.core.allProjectPackageInfos;
  },
  get activeProjectPackageInfos(): IProjectPackageInfo[] {
    return uiState.core.allProjectPackageInfos.filter(
      (it) => it.origin !== 'online_suspend',
    );
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
  get pagePath(): PagePaths {
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
    return (spec && createProjectKey(spec.origin, spec.projectId)) || '';
  },
  get isDeveloperMode() {
    return uiState.core.globalSettings.developerMode;
  },
  get isLocalProjectSelectedForEdit(): boolean {
    const { developerMode, globalProjectSpec } = uiState.core.globalSettings;
    return developerMode && globalProjectSpec?.origin === 'local';
  },
  get editTargetProject(): IProjectPackageInfo | undefined {
    const { globalProjectKey, allProjectPackageInfos } = uiReaders;
    return allProjectPackageInfos.find(
      (info) => info.projectKey === globalProjectKey && info.origin === 'local',
    );
  },
  get blockerPageVisible(): boolean {
    return (
      !!uiState.pageSpec ||
      uiReaders.pagePath.startsWith('/profileSetup') ||
      uiReaders.pagePath.startsWith('/projectQuickSetup')
    );
  },
};
