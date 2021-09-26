import { useEffect } from 'qx';
import { fallbackProfileData } from '~/shared';
import { assignerModel } from '~/ui/editors';
import { removeInvalidProfileAssigns } from '~/ui/editors/ProfileEditor/models/ProfileDataHelper';
import { profilesReader } from '~/ui/pages/assigner-page/models/ProfilesReader';
import { dispatchCoreAction } from '~/ui/store';

function affectStoreLoadedProfileDataToModelProfileData() {
  const { loadedProfileData } = profilesReader;
  useEffect(() => {
    if (assignerModel.loadedProfileData !== loadedProfileData) {
      assignerModel.loadProfileData(loadedProfileData);
    }
  }, [loadedProfileData]);
}

let profileStringified: string = JSON.stringify(fallbackProfileData);

function affectModelProfileDataToStoreEditProfile() {
  removeInvalidProfileAssigns(assignerModel.profileData);
  const str = JSON.stringify(assignerModel.profileData);
  if (str !== profileStringified) {
    const obj = JSON.parse(str);
    dispatchCoreAction({
      profile_setEditProfileData: { editProfileData: obj },
    });
    profileStringified = str;
  }
}

export function updateProfileDataSourceHandling() {
  affectStoreLoadedProfileDataToModelProfileData();
  affectModelProfileDataToStoreEditProfile();
}
