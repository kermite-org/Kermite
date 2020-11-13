import { css } from 'goober';
import { h } from '~lib/qx';
import { models } from '~ui/models';

export const ProfileConfigurationPart = () => {
  const cssBase = css`
    padding: 5px;
  `;

  const currentAssignType = models.editorModel.profileData.assignType;

  return <div css={cssBase}>assign model: {currentAssignType}</div>;
};
