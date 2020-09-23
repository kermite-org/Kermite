import { css } from 'goober';
import { h } from '~lib/qx';

export function ScalerBox(props: {
  boxId: string;
  contentWidth: number;
  contentHeight: number;
  children: any;
}) {
  const { boxId, contentWidth, contentHeight, children } = props;
  const el = document.getElementById(boxId) as HTMLElement | undefined;
  if (el) {
    const { clientWidth: w, clientHeight: h } = el;
    const sc = Math.min(w / contentWidth, h / contentHeight);
    const mh = Math.max((w - contentWidth * sc) / 2, 0);
    const mv = Math.max((h - contentHeight * sc) / 2, 0);

    const cssBaseDiv = css`
      flex-grow: 1;
      width: 100%;
      height: 100%;
      overflow: hidden;
      position: relative;
    `;
    const cssInner = css`
      position: absolute;
      top: 0;
      left: 0;
      width: ${contentWidth}px;
      height: ${contentHeight}px;
      transform: scale(${sc}, ${sc});
      transform-origin: left top;
      margin-left: ${mh}px;
      margin-top: ${mv}px;
    `;
    return (
      <div id={boxId} css={cssBaseDiv}>
        <div css={cssInner}>{children}</div>
      </div>
    );
  } else {
    return <div id={boxId}>{children}</div>;
  }
}
