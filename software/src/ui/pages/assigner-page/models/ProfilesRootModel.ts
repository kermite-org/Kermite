import { useEffect } from 'qx';
import { assignerModel } from '~/ui/featureEditors';
import { profilesReader } from '~/ui/pages/assigner-page/models/ProfilesReader';
import { dispatchCoreAction } from '~/ui/store';

export function updateProfileDataSourceHandling() {
  const { loadedProfileData } = profilesReader;
  useEffect(() => {
    if (assignerModel.loadedProfileData !== loadedProfileData) {
      assignerModel.loadProfileData(loadedProfileData);
    }
  }, [loadedProfileData]);

  useEffect(() => {
    dispatchCoreAction({
      profile_setEditProfileData: {
        editProfileData: assignerModel.profileData,
      },
    });
  }, [assignerModel.profileData]);
}
