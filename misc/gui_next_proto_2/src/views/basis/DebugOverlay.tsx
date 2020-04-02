import { css } from 'goober';
import { hx } from './qx';
import { createClosureComponent } from './qxUtils';

export const DebugOverlay = createClosureComponent(() => {
  const cssTab = css`
    position: absolute;
    top: 0;
    right: 0;
    font-size: 10px;
    width: 15px;
    height: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    user-select: none;
    background: #ae0;
    color: #008;
  `;

  const cssDebugPane = css`
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    color: #0f0;
    pointer-events: none;
    overflow: auto;
    padding: 5px;
    font-size: 10px;
  `;

  let visible = true;

  const toggleVisible = () => {
    visible = !visible;
  };

  return (props: { debugObj?: any }) =>
    props.debugObj ? (
      <div>
        <div css={cssTab} onClick={toggleVisible}>
          D
        </div>
        {visible && (
          <div css={cssDebugPane}>
            {JSON.stringify(props.debugObj, null, '  ')}
          </div>
        )}
      </div>
    ) : null;
});
