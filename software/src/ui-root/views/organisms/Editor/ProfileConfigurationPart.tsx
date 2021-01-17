import { css } from 'goober';
import { h } from 'qx';
import { models } from '@ui-root/models';

export const ProfileConfigurationPart = () => {
  const cssBase = css`
    padding: 5px;
  `;

  const currentAssignType = models.editorModel.profileData.assignType;

  return <div css={cssBase}>assign model: {currentAssignType}</div>;
};
