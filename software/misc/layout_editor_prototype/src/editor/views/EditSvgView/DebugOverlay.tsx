import { css } from 'goober';
import { appGlobal } from '~/editor/base/AppGlobal';
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

  const { debugObject, hasDebugValue } = appGlobal;
  return (
    <div css={cssDebugOverlay} qxIf={hasDebugValue}>
      {Object.keys(debugObject).map((key) => {
        const value = debugObject[key];
        return (
          <div key={key}>
            {key}: {JSON.stringify(value)}
          </div>
        );
      })}
    </div>
  );
};
