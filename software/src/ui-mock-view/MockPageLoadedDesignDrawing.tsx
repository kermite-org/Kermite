import { jsx, css, useEffect } from 'alumina';
import {
  createFallbackDisplayKeyboardDesign,
  IDisplayKeyboardDesign,
  DisplayKeyboardDesignLoader,
} from '~/shared';
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
  useEffect(() => {
    const persistDesign = loadLocalStorageKeyboardDesignOrDefault();
    const design =
      DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(persistDesign);
    console.log({ design });
    state.design = design;
  }, []);

  const { design } = state;

  const da = design.displayArea;
  return (
    <div class={cssRootDiv}>
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
              {/* {ke.shape.type === 'circle' && (
                <circle
                  cx={0}
                  cy={0}
                  r={ke.shape.radius}
                  stroke="#0A0"
                  fill="transparent"
                />
              )} */}
              {ke.shape.type === 'polygon' && (
                <polygon
                  points={ke.shape.points.map((p) => `${p.x},${p.y}`).join(' ')}
                  stroke="#0A0"
                  fill="transparent"
                />
              )}
              <g>
                <text x={0} y={-10} class={cssText} transform="scale(0.3)">
                  {ke.keyId}
                </text>
                <text x={0} y={10} class={cssText} transform="scale(0.3)">
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

          <g transform={`translate(${da.centerX}, ${da.centerY})`}>
            <rect
              x={-da.width / 2}
              y={-da.height / 2}
              width={da.width}
              height={da.height}
              stroke="#888"
              fill="transparent"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};
