import { css } from 'goober';
import { h } from '~lib/qx';
import { appDomain } from '~ui/models/zAppDomain';

export const ConfigurationButton = () => {
  const cssConfigurationButton = css`
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  `;

  const onClick = () => {
    appDomain.uiStatusModel.status.profileConfigModalVisible = true;
  };

  return (
    <div css={cssConfigurationButton} onClick={onClick}>
      <i class="fa fa-cog" />
    </div>
  );
};
