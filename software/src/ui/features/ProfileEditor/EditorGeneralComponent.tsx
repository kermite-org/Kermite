import { css, FC, jsx, useEffect } from 'qx';
import { IPersistProfileData, ProfileDataConverter } from '~/shared';
import { KeyAssignEditView } from '~/ui/features/ProfileEditor/KeyAssignEditView';
import { editorModel } from '~/ui/features/ProfileEditor/models/EditorModel';
import { ProfileConfigratuionModalLayer } from '~/ui/features/ProfileEditor/ui_modal_profileConfiguration';

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

  return (
    <div css={style}>
      <KeyAssignEditView />
      <ProfileConfigratuionModalLayer />
    </div>
  );
};

const style = css`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;
