import { cloneObject, removeArrayItems } from '~/shared';
import { IGrPathNode, IGrPathSegmentNode, IPoint } from '../base';
import { vectorOp } from '../funcs';

type IPathComposer_composePath = (nodes: IGrPathSegmentNode[]) => IGrPathNode[];

function isSameCoord(pa: IPoint, pb: IPoint) {
  // return pa.x === pb.x && pa.y === pb.y;
  return vectorOp.getDist(pa, pb) < 0.004;
}

function getOppositePoint(node: IGrPathSegmentNode, p: IPoint): IPoint {
  const pts = node.points;
  return isSameCoord(p, pts[0]) ? pts[pts.length - 1] : pts[0];
}

function hasEdgePoint(node: IGrPathSegmentNode, p: IPoint): boolean {
  const pts = node.points;
  return isSameCoord(pts[0], p) || isSameCoord(pts[pts.length - 1], p);
}

export const pathComposer_composePath: IPathComposer_composePath = (
  srcNodes,
) => {
  // console.log({ srcNodes });
  const remainingNodes = cloneObject(srcNodes);
  const paths: IGrPathNode[] = [];

  while (remainingNodes.length > 0) {
    const curNode = remainingNodes.shift()!;
    const segmentNodes: IGrPathSegmentNode[] = [curNode];
    const pathStartPoint = curNode.points[0];
    let p1 = getOppositePoint(curNode, pathStartPoint);
    let closed = false;
    while (1) {
      const nextNode = remainingNodes.find((node) => hasEdgePoint(node, p1));
      if (!nextNode) break;
      if (!isSameCoord(nextNode.points[0], p1)) {
        nextNode.points.reverse();
        if (nextNode.type === 'grArc') {
          nextNode.arcFlipped = !nextNode.arcFlipped;
        }
      }
      removeArrayItems(remainingNodes, nextNode);
      segmentNodes.push(nextNode);
      p1 = getOppositePoint(nextNode, p1);
      if (isSameCoord(p1, pathStartPoint)) {
        closed = true;
        break;
      }
    }
    if (closed) {
      paths.push({
        type: 'path',
        segments: segmentNodes,
      });
    }
  }
  return paths;
};
