import { jsx, css, FC } from 'alumina';
import { layouterAppGlobal } from '../../../common';

export const DebugOverlay: FC = () => {
  const { debugObject, hasDebugValue } = layouterAppGlobal;
  return (
    <div class={style} if={hasDebugValue}>
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

const style = css`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  opacity: 0.7;

  word-break: break-all;
  font-size: 14px;
  margin: 2px;
`;
