import { useEffect } from 'qx';
import { ipcAgent } from '~/ui/base';
import { useKeyboardBehaviorModeModel } from '~/ui/commonModels';
import { editorModel } from '~/ui/pages/editor-page/models/EditorModel';
import { profilesReader } from '~/ui/pages/editor-page/models/ProfilesReader';

function updateEditSourceProfileOnRender() {
  const { loadedProfileData } = profilesReader;
  useEffect(() => {
    // console.log('apply loaded profile to editor model');
    editorModel.loadProfileData(loadedProfileData);
  }, [loadedProfileData]);
}

let profileStringified: string = '';

function affectToSimulatorIfEditProfileChanged() {
  const { isSimulatorMode } = useKeyboardBehaviorModeModel();
  const profile = editorModel.profileData;
  if (isSimulatorMode) {
    const str = JSON.stringify(profile);
    if (str !== profileStringified) {
      profileStringified = str;
      ipcAgent.async.simulator_postSimulationTargetProfile(profile);
    }
  }
}

export function updateProfileDataSourceHandling() {
  updateEditSourceProfileOnRender();
  affectToSimulatorIfEditProfileChanged();
}
