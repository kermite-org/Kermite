import { h, css } from 'qx';

export const SiteDpiScaler = (props: { children: any; dpiScale: number }) => {
  const { children, dpiScale } = props;
  const baseW = window.innerWidth;
  const baseH = window.innerHeight;

  const style = css`
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

  return (
    <div css={style}>
      <div className="inner">{children}</div>
    </div>
  );
};
