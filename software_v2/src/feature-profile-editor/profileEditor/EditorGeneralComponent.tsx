import { FC, css, jsx, useEffect } from 'alumina';
import {
  IPersistKeyboardLayout,
  IPersistProfileData,
  ProfileDataConverter,
} from '~/app-shared';
import { KeyAssignEditView } from './KeyAssignEditView';
import { assignerModel } from './models';
import { ProfileConfigurationModalLayer } from './ui_modal_profileConfiguration';

type Props = {
  originalProfile: IPersistProfileData;
  keyboardLayout: IPersistKeyboardLayout;
};

export const AssignerGeneralComponent_OutputPropsSupplier = {
  get isModified() {
    return assignerModel.checkDirty();
  },
  emitSavingDesign() {
    return ProfileDataConverter.convertProfileDataToPersist(
      assignerModel.profileData,
      assignerModel.referredLayoutName,
    );
  },
};

export const AssignerGeneralComponent: FC<Props> = ({
  originalProfile,
  keyboardLayout,
}) => {
  useEffect(() => {
    assignerModel.preserveEditData();
    const profileData = ProfileDataConverter.convertProfileDataFromPersist(
      originalProfile,
      keyboardLayout,
    );
    assignerModel.loadProfileData(
      profileData,
      originalProfile.referredLayoutName,
    );

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
