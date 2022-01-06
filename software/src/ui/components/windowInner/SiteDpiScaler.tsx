import { jsx, css, AluminaNode, FC } from 'alumina';

type Props = {
  children: AluminaNode;
  dpiScale: number;
};

export const SiteDpiScaler: FC<Props> = ({ children, dpiScale }) => {
  const baseW = window.innerWidth;
  const baseH = window.innerHeight;
  return (
    <div class={style(baseW, baseH, dpiScale)}>
      <div class="inner">{children}</div>
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
