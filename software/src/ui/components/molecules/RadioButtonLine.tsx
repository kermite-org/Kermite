import { css, FC, jsx } from 'qx';

type Props = {
  className?: string;
  checked: boolean;
  onClick?: () => void;
  text: string;
  disabled?: boolean;
};

export const RadioButtonLine: FC<Props> = ({
  className,
  checked,
  onClick,
  text,
  disabled,
}) => (
  <label css={style} classNames={[className, disabled && '--disabled']}>
    <input
      type="radio"
      checked={checked}
      onClick={onClick}
      disabled={disabled}
    />
    <span>{text}</span>
  </label>
);

const style = css`
  cursor: pointer;

  > input {
    margin-right: 2px;
  }

  &.--disabled {
    cursor: inherit;
    pointer-events: none;
    > span {
      opacity: 0.5;
    }
  }
`;
