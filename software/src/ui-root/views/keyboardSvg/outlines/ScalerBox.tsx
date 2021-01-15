import { appUi } from '@ui-common';
import { css } from 'goober';
import { h, Hook } from 'qx';

const cssBase = css`
  width: 100%;
  height: 100%;
  /* border: solid 2px #f0f; */
  position: relative;
`;

const cssInner = css`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto auto;
  transform-origin: left top;
  /* border: solid 2px blue; */
`;

interface IScalerBoxProps {
  contentWidth: number;
  contentHeight: number;
  children: any;
}

export function ScalerBox(props: IScalerBoxProps) {
  const local = Hook.useMemo(
    () => ({
      domBaseElementId: `scalerBox-${(Math.random() * 10000) >> 0}`,
      scale: 1.0,
      mh: 0,
      mv: 0,
    }),
    [],
  );

  const { contentWidth, contentHeight, children } = props;

  const baseEl = document.getElementById(local.domBaseElementId);
  if (!baseEl) {
    setTimeout(() => appUi.rerender, 1);
  } else {
    const { clientWidth: bw, clientHeight: bh } = baseEl;
    local.scale = Math.min(bw / contentWidth, bh / contentHeight);
    local.mh = Math.max((bw - contentWidth * local.scale) / 2, 0);
    local.mv = Math.max((bh - contentHeight * local.scale) / 2, 0);
    // console.log({ scale });
  }

  return (
    <div css={cssBase} id={local.domBaseElementId}>
      <div
        css={cssInner}
        style={{
          width: `${contentWidth}px`,
          height: `${contentHeight}px`,
          transform: `scale(${local.scale}, ${local.scale})`,
          marginLeft: `${local.mh}px`,
          marginTop: `${local.mv}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
