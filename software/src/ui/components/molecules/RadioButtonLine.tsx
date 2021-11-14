import { css, FC, jsx } from 'alumina';

type Props = {
  className?: string;
  checked: boolean;
  onClick?: () => void;
  text: string;
  disabled?: boolean;
  radioGroupName?: string;
};

export const RadioButtonLine: FC<Props> = ({
  className,
  checked,
  onClick,
  text,
  disabled,
  radioGroupName,
}) => (
  <div
    css={style}
    classNames={[className, disabled && '--disabled']}
    onClick={onClick}
  >
    <input
      type="radio"
      name={radioGroupName}
      checked={checked}
      disabled={disabled}
    />
    <span>{text}</span>
  </div>
);

const style = css`
  cursor: pointer;

  > input {
    pointer-events: none;
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
