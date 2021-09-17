import { useEffect } from 'qx';
import { fallbackProfileData } from '~/shared';
import { dispatchCoreAction } from '~/ui/commonStore';
import { editorModel } from '~/ui/features/ProfileEditor/models/EditorModel';
import { removeInvalidProfileAssigns } from '~/ui/features/ProfileEditor/models/ProfileDataHelper';
import { profilesReader } from '~/ui/pages/editor-page/models/ProfilesReader';

function affectStoreLoadedProfileDataToModelProfileData() {
  const { loadedProfileData } = profilesReader;
  useEffect(() => {
    if (editorModel.loadedProfileData !== loadedProfileData) {
      editorModel.loadProfileData(loadedProfileData);
    }
  }, [loadedProfileData]);
}

let profileStringified: string = JSON.stringify(fallbackProfileData);

function affectModelProfileDataToStoreEditProfile() {
  removeInvalidProfileAssigns(editorModel.profileData);
  const str = JSON.stringify(editorModel.profileData);
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
