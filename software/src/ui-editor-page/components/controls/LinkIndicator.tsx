import { css } from 'goober';
import { h } from 'qx';
import { uiTheme } from '~/ui-common';

export const LinkIndicator = (props: { isActive: boolean }) => {
  const cssLinkIndicator = css`
    color: #aaa;
    opacity: 0.5;

    &[data-active] {
      color: ${uiTheme.colors.clLinkIndicator};
      opacity: 1;
    }
  `;

  return (
    <div
      css={cssLinkIndicator}
      data-active={props.isActive}
      data-hint="Device connection status"
    >
      <i class="fa fa-link" />
    </div>
  );
};
