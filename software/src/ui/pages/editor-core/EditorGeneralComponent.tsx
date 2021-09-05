import { FC, jsx, useEffect } from 'qx';
import { IPersistProfileData, ProfileDataConverter } from '~/shared';
import { KeyAssignEditView } from '~/ui/pages/editor-core/KeyAssignEditView';
import { editorModel } from '~/ui/pages/editor-core/models/EditorModel';

type Props = {
  originalProfile: IPersistProfileData;
};

export const AssignerGeneralComponent_OutputPropsSupplier = {
  get isModified() {
    return editorModel.checkDirty();
  },
  emitSavingDesign() {
    return ProfileDataConverter.convertProfileDataToPersist(
      editorModel.profileData,
    );
  },
};

export const AssignerGeneralComponent: FC<Props> = ({ originalProfile }) => {
  useEffect(() => {
    const profileData =
      ProfileDataConverter.convertProfileDataFromPersist(originalProfile);
    editorModel.loadProfileData(profileData);
  }, [originalProfile]);

  return <KeyAssignEditView forceHideTestInputArea={true} />;
};
