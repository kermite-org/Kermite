import { css, FC, jsx } from 'qx';
import { texts } from '~/ui/base';

type Props = {
  onClick(): void;
};

export const ConfigurationButton: FC<Props> = ({ onClick }) => (
  <div
    css={style}
    onClick={onClick}
    data-hint={texts.hint_assigner_topBar_profileConfigurationButton}
  >
    <i class="fa fa-cog" />
  </div>
);

const style = css`
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;
