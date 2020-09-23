import { css } from 'goober';
import { h } from '~lib/qx';
import { models, uiStatusModel } from '~ui/models';

export const ConfigurationButton = () => {
  const cssConfigurationButton = css`
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  `;

  const onClick = () => {
    uiStatusModel.status.profileConfigModalVisible = true;
  };

  return (
    <div css={cssConfigurationButton} onClick={onClick}>
      <i class="fa fa-cog" />
    </div>
  );
};
