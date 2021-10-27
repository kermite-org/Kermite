import { css, FC, jsx } from 'qx';
import { colors, texts } from '~/ui/base';

type Props = {
  isActive: boolean;
};

export const LinkIndicator: FC<Props> = ({ isActive }) => (
  <div
    css={style}
    data-active={isActive}
    data-hint={texts.hint_assigner_topBar_deviceConnectionStatus}
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
