import { h } from 'qx';
import { css } from 'qx/cssinjs';

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
      data-hint="Open profile configuration modal."
    >
      <i class="fa fa-cog" />
    </div>
  );
};
