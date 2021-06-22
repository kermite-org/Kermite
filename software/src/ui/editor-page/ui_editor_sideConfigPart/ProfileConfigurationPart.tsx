import { jsx, css } from 'qx';
import { texts, useProjectResourceInfos } from '~/ui/common';
import { editorModel } from '~/ui/editor-page/models/EditorModel';

const style = css`
  padding: 5px;

  > * + * {
    margin-top: 5px;
  }
`;

export const ProfileConfigurationPart = () => {
  const projectInfos = useProjectResourceInfos('projectsSortedByKeyboardName');
  const projectId = editorModel.profileData.projectId;
  const info = projectInfos.find((it) => it.projectId === projectId);
  const keyboardName = info?.keyboardName;

  const currentAssignType = editorModel.profileData.settings.assignType;

  return (
    <div css={style}>
      <div>keyboard: {keyboardName}</div>
      <div data-hint={texts.hint_assigner_configs_assignModel}>
        {texts.label_assigner_configs_assignModel}: {currentAssignType}
      </div>
    </div>
  );
};
