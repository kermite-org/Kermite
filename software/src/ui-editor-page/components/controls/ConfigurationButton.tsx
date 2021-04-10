import { css, jsx } from 'qx';
import { texts } from '~/ui-common';

export const ConfigurationButton = (props: { onClick(): void }) => {
  const cssConfigurationButton = css`
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  `;

  return (
    <div
      css={cssConfigurationButton}
      onClick={props.onClick}
      data-hint={texts.hint_assigner_topBar_profileConfigurationButton}
    >
      <i class="fa fa-cog" />
    </div>
  );
};
