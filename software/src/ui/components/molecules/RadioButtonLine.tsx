import { css, FC, jsx } from 'qx';

type Props = {
  className?: string;
  checked: boolean;
  onClick?: () => void;
  text: string;
};

export const RadioButtonLine: FC<Props> = ({
  className,
  checked,
  onClick,
  text,
}) => (
  <label css={style} className={className}>
    <input type="radio" checked={checked} onClick={onClick} />
    <span>{text}</span>
  </label>
);

const style = css`
  cursor: pointer;

  > input {
    margin-right: 2px;
  }
`;
