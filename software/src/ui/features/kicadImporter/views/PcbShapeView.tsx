/* eslint-disable react/jsx-key */
import { AluminaNode, css, domStyled, FC, jsx } from 'alumina';
import { IFootprintDisplayMode, IGraphicsNode } from '../base';
import { kicadImporterStore } from '../store';

function getGraphicsNodePathSpec(node: IGraphicsNode): string {
  if (node.type === 'grRect') {
    const p0 = node.points[0];
    const p2 = node.points[1];
    const p1 = { x: p2.x, y: p0.y };
    const p3 = { x: p0.x, y: p2.y };
    return `M${p0.x},${p0.y} L${p1.x},${p1.y} L${p2.x},${p2.y} L${p3.x},${p3.y}Z`;
  } else if (node.type === 'grCircle') {
    const cp = node.center;
    const r = node.radius;
    return (
      `M${cp.x + r},${cp.y}` +
      `A${r},${r},0,0,0,${cp.x - r},${cp.y}` +
      `A${r},${r},0,0,0,${cp.x + r},${cp.y}Z`
    );
  } else if (node.type === 'grPoly') {
    return (
      node.points
        .map((p, idx) => `${idx === 0 ? 'M' : 'L'}${p.x},${p.y}`)
        .join(' ') + 'Z'
    );
  } else if (node.type === 'path') {
    return (
      node.segments
        .map((seg, idx) => {
          const headCmd = idx === 0 ? 'M' : 'L';
          if (seg.type === 'grLine') {
            const p0 = seg.points[0];
            const p1 = seg.points[1];
            return `${headCmd}${p0.x},${p0.y} L${p1.x},${p1.y}`;
          } else if (seg.type === 'grArc') {
            const p0 = seg.points[0];
            const p2 = seg.points[2];
            const r = seg.radius;
            const fSweep = seg.arcFlipped ? 0 : 1;
            return `${headCmd}${p0.x},${p0.y} A${r},${r},0,0,${fSweep},${p2.x},${p2.y}`;
            // return `${headCmd}${p0.x},${p0.y} L${p1.x},${p1.y} L${p2.x},${p2.y}`;
          } else if (seg.type === 'grCurve') {
            const p0 = seg.points[0];
            const p1 = seg.points[1];
            const p2 = seg.points[2];
            const p3 = seg.points[3];
            return `${headCmd}${p0.x},${p0.y} C${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;
          }
          return '';
        })
        .join(' ') + 'Z'
    );
  }
  throw new Error('invalid condition');
}

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
    state: { pcbShapeData, footprintDisplayMode },
    readers: { filteredFootprints },
  } = kicadImporterStore;
  const { boundingBox: bb, outlines } = pcbShapeData;
  const viewBoxSpec = `${bb.x} ${bb.y} ${bb.w} ${bb.h}`;
  const outlinePathSpec = outlines
    .map((gr) => getGraphicsNodePathSpec(gr))
    .join(' ');

  const footprintRenderer = footprintRendererMap[footprintDisplayMode];
  const footprintRefTextY = footprintRefTextYMap[footprintDisplayMode];
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
                fp.at.angle || 0
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
                fp.at.angle || 0
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
