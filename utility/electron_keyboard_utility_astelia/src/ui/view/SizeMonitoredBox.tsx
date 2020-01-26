import { css, jsx } from '@emotion/core';
import React from 'react';
import ResizeObserver from 'resize-observer-polyfill';

export const getDomSize = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  const w = (rect.right - rect.left) >> 0;
  const h = (rect.bottom - rect.top) >> 0;
  return { w, h };
};

export type TSize = {
  w: number;
  h: number;
};

function useLatest<T>(value: T): T {
  const ref = React.useRef(value);
  ref.current = value;
  return ref.current;
}

export const useDomSizeMonitor = (
  ref: React.MutableRefObject<HTMLElement | null>,
  sizeChangedCallback: (sz: TSize) => void
) => {
  const sizeChangedCallbackLatest = useLatest(sizeChangedCallback);

  React.useEffect(() => {
    const node = ref.current;
    if (node) {
      const ro = new ResizeObserver(entries => {
        const entry = entries[0];
        const rect = entry.contentRect;
        sizeChangedCallbackLatest({ w: rect.width, h: rect.height });
      });
      ro.observe(node);
      return () => {
        ro.unobserve(node);
        ro.disconnect();
      };
    }
    return () => {};
  }, []);
};

export const AutoScaledBox = (props: {
  children: React.ReactChild;
  contentWidth: number;
  contentHeight: number;
}) => {
  const { children, contentWidth, contentHeight } = props;

  const [size, setSize] = React.useState({ w: 0, h: 0 });

  const baseDivRef = React.useRef<HTMLDivElement>(null);
  useDomSizeMonitor(baseDivRef, setSize);

  const sc = Math.min(size.w / contentWidth, size.h / contentHeight);
  const mh = Math.max((size.w - contentWidth * sc) / 2, 0);
  const mv = Math.max((size.h - contentHeight * sc) / 2, 0);

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
    <div css={cssBaseDiv} ref={baseDivRef}>
      <div css={cssInner}>{children}</div>
    </div>
  );
};
