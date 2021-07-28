import { css, jsx } from 'qx';
import { texts, uiTheme } from '~/ui/base';

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
      data-hint={texts.hint_assigner_topBar_deviceConnectionStatus}
    >
      <i class="fa fa-link" />
    </div>
  );
};
