import { IGraphicsNode } from '../base';

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
  return '';
}

export function outlineShapePathBuilder_buildPathSpecString(
  outlines: IGraphicsNode[],
): string {
  return outlines.map((gr) => getGraphicsNodePathSpec(gr)).join(' ');
}
