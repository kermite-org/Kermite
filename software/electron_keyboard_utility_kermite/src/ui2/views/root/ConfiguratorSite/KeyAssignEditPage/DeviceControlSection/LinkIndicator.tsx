import { css } from 'goober';
import { h } from '~ui2/views/basis/qx';
import { appDomain } from '~ui2/models/zAppDomain';

export const LinkIndicator = () => {
  const cssLinkIndicator = css`
    color: #aaa;
    opacity: 0.5;

    &[data-active] {
      color: #0df;
      opacity: 1;
    }
  `;

  const { isConnected } = appDomain.deviceStatusModel;

  return (
    <div css={cssLinkIndicator} data-active={isConnected}>
      <i class="fa fa-link" />
    </div>
  );
};
