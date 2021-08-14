import { IGlobalSettings } from '~/shared';
import { coreState } from '~/shell/global';
import { globalSettingsProvider } from '~/shell/services/config/GlobalSettingsProvider';

export function setupGlobalSettingsFixer() {
  globalSettingsProvider.settingsFixerCallback = (
    diff: Partial<IGlobalSettings>,
  ) => {
    const reqCheck =
      diff.developerMode !== undefined ||
      diff.useLocalResouces !== undefined ||
      diff.localProjectRootFolderPath !== undefined;
    if (reqCheck) {
      const settings = globalSettingsProvider.globalSettings;
      const { globalProjectId } = settings;
      if (globalProjectId) {
        const projectInfos = coreState.allProjectPackageInfos;
        const isGlobalProjectIncludedInResources = projectInfos.some(
          (info) => info.projectId === globalProjectId,
        );
        if (!isGlobalProjectIncludedInResources) {
          globalSettingsProvider.writeGlobalSettings({ globalProjectId: '' });
        }
      }
    }
  };
}
