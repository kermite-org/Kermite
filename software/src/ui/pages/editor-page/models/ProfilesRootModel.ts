import { useEffect } from 'qx';
import { compareObjectByJsonStringify, IProfileManagerStatus } from '~/shared';
import { ipcAgent } from '~/ui/base';
import { useKeyboardBehaviorModeModel } from '~/ui/commonModels';
import { uiState } from '~/ui/commonStore';
import { editorModel } from '~/ui/pages/editor-page/models/EditorModel';

function updateEditSourceProfileOnRender() {
  const handleProfileStatusChange = (status: IProfileManagerStatus) => {
    if (
      !compareObjectByJsonStringify(
        status.loadedProfileData,
        editorModel.loadedProfileData,
      )
    ) {
      editorModel.loadProfileData(status.loadedProfileData);
    }
  };
  const status = uiState.core.profileManagerStatus;
  useEffect(() => handleProfileStatusChange(status), [status]);
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
