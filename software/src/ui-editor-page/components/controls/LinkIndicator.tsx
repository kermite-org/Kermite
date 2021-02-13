import { css, jsx } from 'qx';
import { texts, uiTheme } from '~/ui-common';

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
      data-hint={texts.hintDeviceConnectionStatus}
    >
      <i class="fa fa-link" />
    </div>
  );
};
