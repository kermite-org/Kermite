import { h, css } from 'qx';
import { appUi } from '~/ui-common/base';
import { useLocal } from '~/ui-common/helpers';

const cssTab = css`
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  margin-top: 30px;
  font-size: 12px;
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
  margin-top: 30px;
  height: calc(100% - 30px);
  background: rgba(0, 0, 0, 0.3);
  color: #0f0;
  pointer-events: none;
  overflow: hidden;
  padding: 5px;
  font-size: 10px;
  padding-top: 15px;
`;

export const DebugOverlay = () => {
  const baseVisible = appUi.isDevelopment && appUi.hasDebugValue;
  const state = useLocal({ isOpen: true });

  const toggleOpen = () => {
    state.isOpen = !state.isOpen;
  };

  return baseVisible ? (
    <div>
      <div css={cssTab} onClick={toggleOpen}>
        D
      </div>
      {state.isOpen && (
        <div css={cssDebugPane}>
          <pre>{JSON.stringify(appUi.debugObject, null, '  ')}</pre>
        </div>
      )}
    </div>
  ) : null;
};
