import { css } from 'goober';
import { h } from '~lib/qx';
import { deviceStatusModel } from '~ui/models';

export const LinkIndicator = () => {
  const cssLinkIndicator = css`
    color: #aaa;
    opacity: 0.5;

    &[data-active] {
      color: #0df;
      opacity: 1;
    }
  `;

  const { isConnected } = deviceStatusModel;

  return (
    <div css={cssLinkIndicator} data-active={isConnected}>
      <i class="fa fa-link" />
    </div>
  );
};
