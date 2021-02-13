import { css, jsx } from 'qx';
import { texts } from '~/ui-common';
import { editorModel } from '~/ui-editor-page/EditorMainPart/models/EditorModel';

export const ProfileConfigurationPart = () => {
  const cssBase = css`
    padding: 5px;
  `;

  const currentAssignType = editorModel.profileData.settings.assignType;

  return (
    <div css={cssBase} data-hint={texts.hintAssignModelDisplay}>
      {texts.labelAssignModel}: {currentAssignType}
    </div>
  );
};
