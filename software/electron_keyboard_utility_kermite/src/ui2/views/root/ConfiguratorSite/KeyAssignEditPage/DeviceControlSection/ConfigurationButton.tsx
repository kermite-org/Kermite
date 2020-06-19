/* eslint-disable react/prop-types */
import { css } from 'goober';
import { h } from '~ui2/views/basis/qx';
import { appDomain } from '~ui2/models/zAppDomain';

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
