import { jsx, css, QxNode, FC } from 'qx';

type Props = {
  children: QxNode;
  dpiScale: number;
};

export const SiteDpiScaler: FC<Props> = ({ children, dpiScale }) => {
  const baseW = window.innerWidth;
  const baseH = window.innerHeight;
  return (
    <div css={style(baseW, baseH, dpiScale)}>
      <div className="inner">{children}</div>
    </div>
  );
};

const style = (baseW: number, baseH: number, dpiScale: number) => css`
  width: ${baseW}px;
  height: ${baseH}px;
  transform: scale(${dpiScale});
  transform-origin: top left;

  > .inner {
    position: relative;
    width: ${baseW / dpiScale}px;
    height: ${baseH / dpiScale}px;
  }
`;
