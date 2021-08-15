import { css, FC, jsx } from 'qx';
import { Icon } from '~/ui/components/atoms';

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
  <div css={style} className={disabled && '--disabled'} onClick={onClick}>
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