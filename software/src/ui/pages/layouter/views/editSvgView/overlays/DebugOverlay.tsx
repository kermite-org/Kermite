import { jsx, css, FC } from 'qx';
import { layouterAppGlobal } from '~/ui/pages/layouter/common';

export const DebugOverlay: FC = () => {
  const { debugObject, hasDebugValue } = layouterAppGlobal;
  return (
    <div css={style} qxIf={hasDebugValue}>
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
