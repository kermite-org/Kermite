import { css, FC, jsx, useEffect } from 'qx';
import { IPersistProfileData, ProfileDataConverter } from '~/shared';
import { KeyAssignEditView } from '~/ui/editors/ProfileEditor/KeyAssignEditView';
import { assignerModel } from '~/ui/editors/ProfileEditor/models/AssignerModel';
import { ProfileConfigurationModalLayer } from '~/ui/editors/ProfileEditor/ui_modal_profileConfiguration';

type Props = {
  originalProfile: IPersistProfileData;
};

export const AssignerGeneralComponent_OutputPropsSupplier = {
  get isModified() {
    return assignerModel.checkDirty();
  },
  emitSavingDesign() {
    return ProfileDataConverter.convertProfileDataToPersist(
      assignerModel.profileData,
    );
  },
};

export const AssignerGeneralComponent: FC<Props> = ({ originalProfile }) => {
  useEffect(() => {
    assignerModel.preserveEditData();
    const profileData =
      ProfileDataConverter.convertProfileDataFromPersist(originalProfile);
    assignerModel.loadProfileData(profileData);

    return () => assignerModel.restoreEditData();
  }, [originalProfile]);

  return (
    <div css={style}>
      <KeyAssignEditView />
      <ProfileConfigurationModalLayer />
    </div>
  );
};

const style = css`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;
