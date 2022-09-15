/* eslint-disable react/jsx-key */
import { AluminaNode, css, domStyled, FC, jsx } from 'alumina';
import { IFootprintDisplayMode } from '../base';
import { outlineShapePathBuilder_buildPathSpecString } from '../modules';
import { kicadImporterStore } from '../store';

function renderCrosshair() {
  const d = 1.8;
  return [
    <line x1={-d} y1={0} x2={d} y2={0} />,
    <line x1={0} y1={-d} x2={0} y2={d} />,
  ];
}

const footprintRendererMap: Record<IFootprintDisplayMode, () => AluminaNode[]> =
  {
    none() {
      return [];
    },
    plus() {
      return renderCrosshair();
    },
    rect14x14() {
      return [<rect x={-7} y={-7} width={14} height={14} />];
    },
    'rect14x14+'() {
      return [
        <rect x={-7} y={-7} width={14} height={14} />,
        ...renderCrosshair(),
      ];
    },
    rect18x18() {
      return [<rect x={-9} y={-9} width={18} height={18} />];
    },
  };

const footprintRefTextYMap: Record<IFootprintDisplayMode, number> = {
  none: 0,
  plus: 4.5,
  rect14x14: 0,
  'rect14x14+': 4.5,
  rect18x18: 0,
};

export const PcbShapeView: FC = () => {
  const {
    state: { pcbShapeData, footprintDisplayMode, isKeyFacingInverted },
    readers: { filteredFootprints },
  } = kicadImporterStore;
  const { boundingBox: bb, outlines } = pcbShapeData;
  const viewBoxSpec = `${bb.x} ${bb.y} ${bb.w} ${bb.h}`;

  const outlinePathSpec = outlineShapePathBuilder_buildPathSpecString(outlines);

  const footprintRenderer = footprintRendererMap[footprintDisplayMode];
  const footprintRefTextY = footprintRefTextYMap[footprintDisplayMode];

  const additionalAngleForInvertFacing = isKeyFacingInverted ? 180 : 0;

  return domStyled(
    <div id="domSvgPcbShapeViewOuter">
      <svg viewBox={viewBoxSpec}>
        <defs>
          <g id="footprint">{footprintRenderer()}</g>
        </defs>
        <path
          d={outlinePathSpec}
          fill="#def"
          stroke="#08f"
          stroke-width="0.25"
          fill-rule="evenodd"
        />
        <g fill="transparent" stroke="#f08" stroke-width="0.25">
          {filteredFootprints.map((fp, idx) => (
            <use
              href="#footprint"
              key={idx}
              transform={`translate(${fp.at.x} ${fp.at.y}) rotate(${-(
                (fp.at.angle || 0) + additionalAngleForInvertFacing
              )})`}
            />
          ))}
        </g>
      </svg>
      <svg viewBox={viewBoxSpec} class="overlay">
        <g
          fill="#248"
          font-size="3"
          text-anchor="middle"
          dominant-baseline="middle"
          if={footprintDisplayMode !== 'none'}
        >
          {filteredFootprints.map((fp, idx) => (
            <g
              key={idx}
              transform={`translate(${fp.at.x} ${fp.at.y}) rotate(${-(
                (fp.at.angle || 0) + additionalAngleForInvertFacing
              )})`}
            >
              <text x={0} y={footprintRefTextY}>
                {fp.referenceName}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>,
    css`
      position: relative;
      > svg {
        width: 600px;
        height: 300px;
      }

      > svg.overlay {
        position: absolute;
        top: 0;
        left: 0;
      }
    `,
  );
};
