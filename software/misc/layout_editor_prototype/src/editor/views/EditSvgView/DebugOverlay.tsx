import { css } from 'goober';
import { appState } from '~/editor/store';
import { h } from '~/qx';

export const DebugOverlay = () => {
  const cssDebugOverlay = css`
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    opacity: 0.5;

    word-break: break-all;
    font-size: 12px;
  `;
  const show = false;
  return (
    <div css={cssDebugOverlay} qxIf={show}>
      <div>{JSON.stringify(appState.editor.design)}</div>
      <div>{JSON.stringify(appState.env)}</div>
    </div>
  );
};
