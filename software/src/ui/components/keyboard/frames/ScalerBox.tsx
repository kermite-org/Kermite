import {
  jsx,
  asyncRerender,
  css,
  useLocal,
  useRef,
  useEffect,
  QxNode,
  FC,
} from 'qx';

type Props = {
  contentWidth: number;
  contentHeight: number;
  children: QxNode;
};

export const ScalerBox: FC<Props> = ({
  contentWidth,
  contentHeight,
  children,
}) => {
  const local = useLocal({
    scale: 1.0,
    mh: 0,
    mv: 0,
  });

  const ref = useRef<HTMLDivElement>();
  const baseEl = ref.current;
  if (baseEl) {
    const { clientWidth: bw, clientHeight: bh } = baseEl;
    local.scale = Math.min(bw / contentWidth, bh / contentHeight);
    local.mh = Math.max((bw - contentWidth * local.scale) / 2, 0);
    local.mv = Math.max((bh - contentHeight * local.scale) / 2, 0);
  } else {
    asyncRerender();
  }

  useEffect(asyncRerender, [contentWidth, contentHeight]);

  return (
    <div css={cssBase} ref={ref}>
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
};

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
