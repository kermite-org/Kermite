import { css, FC, jsx, useEffect } from 'qx';
import { IPersistProfileData } from '~/shared';
import { ProfileDataConverter } from '~/shared/modules/ProfileDataConverter';
import { uiTheme } from '~/ui/base';
import { KeyAssignEditView } from '~/ui/pages/editor-core/KeyAssignEditView';
import { editorModel } from '~/ui/pages/editor-core/models/EditorModel';

type Props = {
  className?: string;
  originalProfile: IPersistProfileData;
  saveProfile: (value: IPersistProfileData) => void;
};

export const AssignerGeneralComponent: FC<Props> = ({
  className,
  originalProfile,
  saveProfile,
}) => {
  useEffect(() => {
    const profileData =
      ProfileDataConverter.convertProfileDataFromPersist(originalProfile);
    editorModel.loadProfileData(profileData);
  }, [originalProfile]);

  const isModified = editorModel.checkDirty();

  const onSaveButton = () => {
    const savingData = ProfileDataConverter.convertProfileDataToPersist(
      editorModel.profileData,
    );
    saveProfile(savingData);
  };

  return (
    <div css={style} className={className}>
      <div className="topRow">
        <button onClick={onSaveButton} disabled={!isModified}>
          save
        </button>
      </div>
      <KeyAssignEditView forceHideTestInputArea={true} />
    </div>
  );
};

const style = css`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${uiTheme.colors.clBackground};

  > .topRow {
    flex-shrink: 0;
  }
`;
