import { css, FC, jsx } from 'alumina';
import { colors, texts } from '~/ui/base';

type Props = {
  isActive: boolean;
};

export const LinkIndicator: FC<Props> = ({ isActive }) => (
  <div
    css={style}
    data-active={isActive}
    data-hint={texts.assignerTopBarHint.deviceConnectionStatus}
  >
    <i class="fa fa-link" />
  </div>
);

const style = css`
  color: #aaa;
  opacity: 0.5;

  &[data-active] {
    color: ${colors.clLinkIndicator};
    opacity: 1;
  }
`;
