import { css, FC, jsx } from 'alumina';
import { colors, texts } from '~/fe-shared';

type Props = {
  isActive: boolean;
};

export const LinkIndicator: FC<Props> = ({ isActive }) => (
  <div
    class={style}
    data-active={isActive}
    data-hint={texts.assignerTopBarHint.deviceConnectionStatus}
  >
    <i class="fa fa-link" />
  </div>
);

const style = css`
  color: #aaa;
  opacity: 0.8;

  &[data-active] {
    color: ${colors.clLinkIndicator};
    opacity: 1;
  }
`;
