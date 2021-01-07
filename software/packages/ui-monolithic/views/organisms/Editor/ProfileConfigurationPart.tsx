import { css } from 'goober';
import { models } from '~ui/models';
import { h } from '~qx';

export const ProfileConfigurationPart = () => {
  const cssBase = css`
    padding: 5px;
  `;

  const currentAssignType = models.editorModel.profileData.assignType;

  return <div css={cssBase}>assign model: {currentAssignType}</div>;
};
