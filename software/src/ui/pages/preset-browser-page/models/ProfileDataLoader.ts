import { useMemo } from 'qx';
import {
  fallbackProfileData,
  IProfileData,
  IProjectPackageInfo,
} from '~/shared';
import {
  getPresetSpecFromPresetKey,
  getProjectOriginAndIdFromSig,
} from '~/shared/funcs/DomainRelatedHelpers';
import { ProfileDataConverter } from '~/shared/modules/ProfileDataConverter';

export function useProfileDataLoaded(
  projectKey: string,
  presetKey: string,
  resourceInfos: IProjectPackageInfo[],
): IProfileData {
  return useMemo(() => {
    if (projectKey && presetKey) {
      const { origin, projectId } = getProjectOriginAndIdFromSig(projectKey);
      const presetSpec = getPresetSpecFromPresetKey(presetKey);
      const info = resourceInfos.find(
        (info) => info.origin === origin && info.projectId === projectId,
      );
      if (info) {
        if (presetSpec.type === 'preset') {
          const profile = info.presets.find(
            (profile) => profile.presetName === presetSpec.presetName,
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
