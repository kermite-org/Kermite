import { css, FC, jsx } from 'alumina';
import { Icon } from '../../components/atoms';

type Props = {
  iconSpec: string;
  onClick(): void;
  hint?: string;
  disabled?: boolean;
};

export const ConfigurationButton: FC<Props> = ({
  iconSpec,
  onClick,
  disabled,
}) => (
  <div class={[style, disabled && '--disabled']} onClick={onClick}>
    <Icon spec={iconSpec} />
  </div>
);

const style = css`
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }

  &.--disabled {
    opacity: 0.4;
  }
`;
