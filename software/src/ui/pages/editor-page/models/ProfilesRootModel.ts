import { useEffect } from 'qx';
import { fallbackProfileData } from '~/shared';
import { commitCoreStateFromUiSide } from '~/ui/commonStore';
import { editorModel } from '~/ui/pages/editor-page/models/EditorModel';
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
  const str = JSON.stringify(editorModel.profileData);
  if (str !== profileStringified) {
    const obj = JSON.parse(str);
    console.log('editorModel.profileData --> store.editProfileData');
    commitCoreStateFromUiSide({ editProfileData: obj });
    profileStringified = str;
  }
}

export function updateProfileDataSourceHandling() {
  affectStoreLoadedProfileDataToModelProfileData();
  affectModelProfileDataToStoreEditProfile();
}
