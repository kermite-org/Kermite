import { css } from 'goober';
import { appState } from '~/editor/models';
import { h } from '~/qx';

export const DebugOverlay = () => {
  const cssDebugOverlay = css`
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    opacity: 0.5;
  `;
  return (
    <div css={cssDebugOverlay}>
      <div>{JSON.stringify(appState.editor.design, null, ' ')}</div>
    </div>
  );
};
