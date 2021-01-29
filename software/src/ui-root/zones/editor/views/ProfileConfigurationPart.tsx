import { css } from 'goober';
import { h } from 'qx';
import { editorModel } from '~/ui-root/zones/editor/models/EditorModel';

export const ProfileConfigurationPart = () => {
  const cssBase = css`
    padding: 5px;
  `;

  const currentAssignType = editorModel.profileData.settings.assignType;

  return <div css={cssBase}>assign model: {currentAssignType}</div>;
};
