import { css } from 'goober';
import { h, Hook, asyncRerender } from 'qx';
import {
  createFallbackDisplayKeyboardDesign,
  IDisplayKeyboardDesign,
} from '~/shared';
import { DisplayKeyboardDesignLoader } from '~/ui-common/modules/DisplayKeyboardDesignLoader';
import { loadLocalStorageKeyboardDesignOrDefault } from '~/ui-mock-view/LocalStoragePersistKeyboardDesign';

const state = new (class {
  design: IDisplayKeyboardDesign = createFallbackDisplayKeyboardDesign();
})();

const cssRootDiv = css`
  height: 100%;
  padding: 10px;

  svg {
    border: solid 1px #888;
  }
`;

const cssText = css`
  text-anchor: middle;
  dominant-baseline: central;
`;

export const MockPageLoadedDesignDrawing = () => {
  Hook.useEffect(() => {
    const persistDesign = loadLocalStorageKeyboardDesignOrDefault();
    const design = DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
      persistDesign,
    );
    console.log({ design });
    state.design = design;
    asyncRerender();
  }, []);

  const { design } = state;

  const bb = design.boundingBox;
  return (
    <div css={cssRootDiv}>
      {/* <pre>{JSON.stringify(state.design, null, ' ')}</pre> */}
      <svg width={600} height={600} viewBox="-100 -100 200 200">
        <g stroke-width={0.5} transform="translate(0, 20)">
          {design.keyEntities.map((ke) => (
            <g
              transform={`translate(${ke.x} ${ke.y}) rotate(${ke.angle})`}
              key={ke.keyId}
            >
              {ke.shape.type === 'rect' && (
                <g>
                  <rect
                    x={-ke.shape.width / 2}
                    y={-ke.shape.height / 2}
                    width={ke.shape.width}
                    height={ke.shape.height}
                    stroke="#0A0"
                    fill="transparent"
                  />
                </g>
              )}
              {ke.shape.type === 'circle' && (
                <circle
                  cx={0}
                  cy={0}
                  r={ke.shape.radius}
                  stroke="#0A0"
                  fill="transparent"
                />
              )}
              {ke.shape.type === 'polygon' && (
                <polygon
                  points={ke.shape.points.map((p) => `${p.x},${p.y}`).join(' ')}
                  stroke="#0A0"
                  fill="transparent"
                />
              )}
              <g>
                <text x={0} y={-10} css={cssText} transform="scale(0.3)">
                  {ke.keyId}
                </text>
                <text x={0} y={10} css={cssText} transform="scale(0.3)">
                  {ke.keyIndex}
                </text>
              </g>
            </g>
          ))}

          {design.outlineShapes.map((shape, idx) => (
            <g key={idx}>
              <polygon
                points={shape.points.map((p) => `${p.x},${p.y}`).join(' ')}
                stroke="#06D"
                fill="rgba(0, 128, 255, 0.1)"
              />
            </g>
          ))}

          <g transform={`translate(${bb.centerX}, ${bb.centerY})`}>
            <rect
              x={-bb.width / 2}
              y={-bb.height / 2}
              width={bb.width}
              height={bb.height}
              stroke="#888"
              fill="transparent"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};
