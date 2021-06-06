import { jsx, css } from 'qx';
import { texts } from '~/ui/common';
import { editorModel } from '~/ui/editor-page/models/EditorModel';

export const ProfileConfigurationPart = () => {
  const cssBase = css`
    padding: 5px;
  `;

  const currentAssignType = editorModel.profileData.settings.assignType;

  return (
    <div css={cssBase} data-hint={texts.hint_assigner_configs_assignModel}>
      {texts.label_assigner_configs_assignModel}: {currentAssignType}
    </div>
  );
};
