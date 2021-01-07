import { css } from 'goober';
import { h } from '~qx';

export const ConfigurationButton = (props: { onClick(): void }) => {
  const cssConfigurationButton = css`
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  `;

  return (
    <div css={cssConfigurationButton} onClick={props.onClick}>
      <i class="fa fa-cog" />
    </div>
  );
};
