import { css, FC, jsx, useEffect } from 'alumina';
import { IPersistProfileData, ProfileDataConverter } from '~/shared';
import { KeyAssignEditView } from '~/ui/featureEditors/ProfileEditor/KeyAssignEditView';
import { assignerModel } from '~/ui/featureEditors/ProfileEditor/models/AssignerModel';
import { ProfileConfigurationModalLayer } from '~/ui/featureEditors/ProfileEditor/ui_modal_profileConfiguration';

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
    <div class={style}>
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
