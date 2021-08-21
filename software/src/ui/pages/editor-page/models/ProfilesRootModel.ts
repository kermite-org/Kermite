import { useEffect } from 'qx';
import { fallbackProfileData } from '~/shared';
import { dispatchCoreAction } from '~/ui/commonStore';
import { editorModel } from '~/ui/pages/editor-page/models/EditorModel';
import { removeInvalidProfileAssigns } from '~/ui/pages/editor-page/models/ProfileDataHelper';
import { profilesReader } from '~/ui/pages/editor-page/models/ProfilesReader';

function affectStoreLoadedProfileDataToModelProfileData() {
  const { loadedProfileData } = profilesReader;
  useEffect(() => {
    console.log('editorModel.profileData <-- store.loadedProfileData');
    editorModel.loadProfileData(loadedProfileData);
  }, [loadedProfileData]);
}

let profileStringified: string = JSON.stringify(fallbackProfileData);

function affectModelProfileDataToStoreEditProfile() {
  removeInvalidProfileAssigns(editorModel.profileData);
  const str = JSON.stringify(editorModel.profileData);
  if (str !== profileStringified) {
    const obj = JSON.parse(str);
    console.log('editorModel.profileData --> store.editProfileData');
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
