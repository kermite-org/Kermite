import { globalSettingsDefault, globalSettingsLoadingSchema } from '~/shared';
import { appEnv, applicationStorage } from '~/shell/base';
import { pathResolve } from '~/shell/funcs';
import { commitCoreState, coreState, createCoreModule } from '~/shell/global';
import { checkLocalRepositoryFolder } from '~/shell/projectResources/LocalResourceHelper';

export const globalSettingsModule = createCoreModule({
  loadGlobalSettings() {
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
    commitCoreState({ globalSettings: settings });
  },
  writeGlobalSettings(partialConfig) {
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

export const globalSettingsReader = {
  getLocalRepositoryDir(): string | undefined {
    const settings = coreState.globalSettings;
    if (settings.developerMode && settings.useLocalResouces) {
      if (appEnv.isDevelopment) {
        return pathResolve('../');
      } else {
        return settings.localProjectRootFolderPath;
      }
    }
    return undefined;
  },
};
