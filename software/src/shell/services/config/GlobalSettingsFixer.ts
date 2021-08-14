import { IGlobalSettings } from '~/shared';
import { projectPackageProvider } from '~/shell/projectPackages/ProjectPackageProvider';
import { globalSettingsProvider } from '~/shell/services/config/GlobalSettingsProvider';

export function setupGlobalSettingsFixer() {
  globalSettingsProvider.settingsFixerCallback = async (
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
        const projectInfos = await projectPackageProvider.getAllProjectPackageInfos();
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
