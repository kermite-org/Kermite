import { css } from 'goober';
import { h } from '~qx';

export const LinkIndicator = (props: { isActive: boolean }) => {
  const cssLinkIndicator = css`
    color: #aaa;
    opacity: 0.5;

    &[data-active] {
      color: #0df;
      opacity: 1;
    }
  `;

  return (
    <div css={cssLinkIndicator} data-active={props.isActive}>
      <i class="fa fa-link" />
    </div>
  );
};
