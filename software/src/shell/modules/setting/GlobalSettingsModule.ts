import { globalSettingsDefault, globalSettingsLoadingSchema } from '~/shared';
import { featureFlags } from '~/shared/defs/FeatureFlags';
import { applicationStorage } from '~/shell/base';
import { commitCoreState, coreState, createCoreModule } from '~/shell/global';
import { checkLocalRepositoryFolder } from '~/shell/modules/project/projectResources/LocalResourceHelper';

export const globalSettingsModule = createCoreModule({
  config_loadGlobalSettings() {
    const settings = applicationStorage.readItemBasedOnDefault(
      'globalSettings',
      globalSettingsLoadingSchema,
      globalSettingsDefault,
    );
    if (settings.localProjectRootFolderPath) {
      if (!checkLocalRepositoryFolder(settings.localProjectRootFolderPath)) {
        console.warn('invalid local repository folder setting');
        settings.localProjectRootFolderPath = '';
      }
    }
    if (!featureFlags.allowEditLocalProject) {
      settings.useLocalResources = false;
    }
    commitCoreState({ globalSettings: settings });
  },
  config_writeGlobalSettings(partialConfig) {
    const globalSettings = {
      ...coreState.globalSettings,
      ...partialConfig,
    };
    const { globalProjectId } = globalSettings;
    if (globalProjectId) {
      const projectInfos = coreState.allProjectPackageInfos;
      const isGlobalProjectIncludedInResources = projectInfos.some(
        (info) => info.projectId === globalProjectId,
      );
      if (!isGlobalProjectIncludedInResources) {
        globalSettings.globalProjectId = '';
      }
    }
    applicationStorage.writeItem('globalSettings', globalSettings);
    commitCoreState({ globalSettings });
  },
});
