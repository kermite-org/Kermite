import {
  globalSettingsDefault,
  globalSettingsLoadingSchema,
  IGlobalSettings,
} from '~/shared';
import { applicationStorage } from '~/shell/base';
import { checkLocalRepositoryFolder } from '~/shell/loaders/LocalResourceHelper';
import {
  commitCoreState,
  coreState,
  createCoreModule,
} from '~/shell/modules/core';

const globalSettingsModuleHelpers = {
  fixGlobalSettingsOnLoad(globalSettings: IGlobalSettings) {
    if (globalSettings.localProjectRootFolderPath) {
      if (
        !checkLocalRepositoryFolder(globalSettings.localProjectRootFolderPath)
      ) {
        console.warn('invalid local repository folder setting');
        globalSettings.localProjectRootFolderPath = '';
      }
    }
  },
  fixGlobalSettingsOnEdit(globalSettings: IGlobalSettings) {
    const { globalProjectSpec } = globalSettings;
    if (globalProjectSpec) {
      const projectInfos = coreState.allProjectPackageInfos;
      // グローバルプロジェクトの選択に対応するパッケージがない場合、グローバルプロジェクトの選択を解除
      const isGlobalProjectIncludedInResources = projectInfos.some(
        (info) =>
          info.projectId === globalProjectSpec.projectId &&
          info.origin === globalProjectSpec.origin,
      );
      if (!isGlobalProjectIncludedInResources) {
        globalSettings.globalProjectSpec = undefined;
      }
      // ローカルのプロジェクトが選択されており、開発者モードが解除された場合、オンラインのプロジェクトを選ぶ
      if (
        globalProjectSpec.origin === 'local' &&
        !globalSettings.developerMode
      ) {
        const onlineInfo = projectInfos.find(
          (info) =>
            info.origin === 'online' &&
            info.projectId === globalProjectSpec.projectId,
        );
        if (onlineInfo) {
          globalSettings.globalProjectSpec = {
            origin: 'online',
            projectId: onlineInfo.projectId,
          };
        } else {
          globalSettings.globalProjectSpec = undefined;
        }
      }
    }
  },
};

export const globalSettingsModule = createCoreModule({
  config_loadGlobalSettings() {
    const globalSettings = applicationStorage.readItemBasedOnDefault(
      'globalSettings',
      globalSettingsLoadingSchema,
      globalSettingsDefault,
    );
    globalSettingsModuleHelpers.fixGlobalSettingsOnLoad(globalSettings);
    commitCoreState({ globalSettings });
  },
  config_writeGlobalSettings(partialConfig) {
    const globalSettings = {
      ...coreState.globalSettings,
      ...partialConfig,
    };
    globalSettingsModuleHelpers.fixGlobalSettingsOnEdit(globalSettings);
    applicationStorage.writeItem('globalSettings', globalSettings);
    commitCoreState({ globalSettings });
  },
});
