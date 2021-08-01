import { jsx, css } from 'qx';
import { texts } from '~/ui/base';
import { useProjectResourceInfos } from '~/ui/commonModels';
import { editorModel } from '~/ui/pages/editor-page/models/EditorModel';
import { profilesModel } from '~/ui/pages/editor-page/ui_bar_profileManagement/viewModels/ProfileManagementPartViewModel';

export const ProfileConfigurationPart = () => {
  const projectInfos = useProjectResourceInfos();
  const projectId = editorModel.profileData.projectId;
  const info = projectInfos.find((it) => it.projectId === projectId);
  const keyboardName = info?.keyboardName;
  const currentAssignType = editorModel.profileData.settings.assignType;

  const { isEditProfileAvailable } = profilesModel;

  return (
    <div css={style}>
      <div>keyboard: {keyboardName}</div>
      <div
        data-hint={texts.hint_assigner_configs_assignModel}
        qxIf={isEditProfileAvailable}
      >
        {texts.label_assigner_configs_assignModel}: {currentAssignType}
      </div>
    </div>
  );
};

const style = css`
  padding: 5px;

  > * + * {
    margin-top: 5px;
  }
`;
