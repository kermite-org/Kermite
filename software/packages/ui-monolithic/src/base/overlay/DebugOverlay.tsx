import { css } from 'goober';
import { h, Hook } from 'qx';

interface IDebugOverlayProps {
  debugObj: any | undefined;
}

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
  height: calc(100% - 40px);
  background: rgba(0, 0, 0, 0.3);
  color: #0f0;
  pointer-events: none;
  overflow: hidden;
  padding: 5px;
  font-size: 10px;
`;

export const DebugOverlay = (props: IDebugOverlayProps) => {
  const state = Hook.useMemo(() => ({ visible: false }), []);

  const toggleVisible = () => {
    state.visible = !state.visible;
  };

  return props.debugObj ? (
    <div>
      <div css={cssTab} onClick={toggleVisible}>
        D
      </div>
      {state.visible && (
        <div css={cssDebugPane}>
          <pre>{JSON.stringify(props.debugObj, null, '  ')}</pre>
        </div>
      )}
    </div>
  ) : null;
};
