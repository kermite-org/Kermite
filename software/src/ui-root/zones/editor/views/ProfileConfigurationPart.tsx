import { css } from 'goober';
import { h } from 'qx';
import { models } from '~/ui-root/zones/common/commonModels';

export const ProfileConfigurationPart = () => {
  const cssBase = css`
    padding: 5px;
  `;

  const currentAssignType = models.editorModel.profileData.settings.assignType;

  return <div css={cssBase}>assign model: {currentAssignType}</div>;
};
