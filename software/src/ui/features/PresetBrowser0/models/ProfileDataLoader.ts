import { useMemo } from 'qx';
import {
  fallbackProfileData,
  IProfileData,
  IProjectPackageInfo,
  ProfileDataConverter,
} from '~/shared';
import {
  getPresetSpecFromPresetKey,
  getOriginAndProjectIdFromProjectKey,
} from '~/shared/funcs/DomainRelatedHelpers';

export function useProfileDataLoaded(
  projectKey: string,
  presetKey: string,
  resourceInfos: IProjectPackageInfo[],
): IProfileData {
  return useMemo(() => {
    if (projectKey && presetKey) {
      const { origin, projectId } =
        getOriginAndProjectIdFromProjectKey(projectKey);
      const presetSpec = getPresetSpecFromPresetKey(presetKey);
      const info = resourceInfos.find(
        (info) => info.origin === origin && info.projectId === projectId,
      );
      if (info) {
        if (presetSpec.type === 'preset') {
          const profile = info.profiles.find(
            (profile) => profile.profileName === presetSpec.presetName,
          );
          if (profile) {
            return ProfileDataConverter.convertProfileDataFromPersist(
              profile.data,
            );
          }
        } else {
          const layout = info.layouts.find(
            (layout) => layout.layoutName === presetSpec.layoutName,
          );
          if (layout) {
            return { ...fallbackProfileData, keyboardDesign: layout.data };
          }
        }
      }
    }
    return fallbackProfileData;
  }, [projectKey, presetKey]);
}
