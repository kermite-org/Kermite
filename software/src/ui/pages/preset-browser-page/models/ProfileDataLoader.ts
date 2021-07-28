import { useEffect, useLocal } from 'qx';
import { fallbackProfileData, IProfileData } from '~/shared';
import {
  getPresetSpecFromPresetKey,
  getProjectOriginAndIdFromSig,
} from '~/shared/funcs/DomainRelatedHelpers';
import { ipcAgent } from '~/ui/common/base';

export function useProfileDataLoaded(
  projectKey: string,
  presetKey: string,
): IProfileData {
  const local = useLocal({ profileData: fallbackProfileData });
  useEffect(() => {
    if (projectKey && presetKey) {
      const { origin, projectId } = getProjectOriginAndIdFromSig(projectKey);
      const presetSpec = getPresetSpecFromPresetKey(presetKey);
      (async () => {
        const _profileData = await ipcAgent.async.projects_loadPresetProfile(
          origin,
          projectId,
          presetSpec,
        );
        local.profileData = _profileData || fallbackProfileData;
      })();
    } else {
      local.profileData = fallbackProfileData;
    }
  }, [projectKey, presetKey]);

  return local.profileData;
}
