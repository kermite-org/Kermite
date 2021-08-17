import { useEffect } from 'qx';
import { compareObjectByJsonStringify, IProfileManagerStatus } from '~/shared';
import { uiState } from '~/ui/commonStore';
import { editorModel } from '~/ui/pages/editor-page/models/EditorModel';

export function updateEditSourceProfileOnRender() {
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
