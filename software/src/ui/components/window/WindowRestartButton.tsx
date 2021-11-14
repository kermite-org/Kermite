import { jsx, css, FC } from 'alumina';

type Props = {
  handler: () => void;
};

export const WindowRestartButton: FC<Props> = ({ handler }) => {
  return (
    <button css={style} onClick={handler}>
      Restart
    </button>
  );
};

const style = css`
  padding: 3px 6px;
  margin-right: 10px;
  cursor: pointer;
`;
