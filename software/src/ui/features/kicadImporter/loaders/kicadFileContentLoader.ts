import { degToRad, sortOrderBy } from '~/shared';
import { IPcbShapeData, IPoint, kicadImporterConfig } from '../base';
import { vectorOp } from '../funcs';
import { calculatePcbShapeBoundingBox } from './boundingBoxCalculator';
import {
  coordRounder_roundFootprintsCoord,
  coordRounder_roundGraphicsCoord,
} from './coordRounder';
import { calculateCircleRadiusFrom3PointArc } from './geometryHelpers';
import { pathComposer_composePath } from './pathComposer';

interface IKicadFileContentLoader {
  loadKicadPcbFileContent(source: string): IPcbShapeData;
}

type ISExpressionRawString = string | ISExpressionRawString[];

type ISExpression = (string | number | boolean) | ISExpression[];

type ISExpressionRoot = [string, ...[string, ISExpression][]];

function readSExpressionArgs(src: string): ISExpressionRawString[] {
  // console.log({ src });

  const nodes: string[] = [];
  let depth = 0;
  let nodeText = '';
  let inString = false;
  let prevChr: string | undefined;
  src.split('').forEach((chr) => {
    if (chr === '(' && !inString) {
      nodeText += '(';
      depth++;
    } else if (chr === ')' && !inString) {
      nodeText += ')';
      depth--;
      if (depth === 0 && nodeText.length > 0) {
        nodes.push(nodeText);
        nodeText = '';
      }
    } else if (depth === 0 && chr === ' ' && !inString) {
      if (nodeText) {
        nodes.push(nodeText);
        nodeText = '';
      }
    } else {
      if (chr === '"' && prevChr !== '\\') {
        inString = !inString;
      }
      if (depth > 0 || chr !== ' ' || inString) {
        nodeText += chr;
      }
    }
    prevChr = chr;
  });
  if (nodeText) {
    nodes.push(nodeText);
  }
  // console.log({ nodes });
  return nodes.map(readSubNodes);
}

function readSubNodes(src: string): ISExpressionRawString {
  if (src.startsWith('(') && src.endsWith(')')) {
    const inner = src.slice(1, src.length - 1);
    // console.log({ inner });
    return readSExpressionArgs(inner);
  } else {
    return src;
  }
}

function convertElementTypes(src: ISExpressionRawString): ISExpression {
  if (Array.isArray(src)) {
    return src.map(convertElementTypes);
  } else {
    const value = src;
    const isNumber = value.match(/^[0-9-.]+$/);
    if (isNumber) {
      return parseFloat(value);
    } else if (value === 'true' || value === 'false') {
      return value === 'true';
    } else if (value.startsWith(`"`) && value.endsWith(`"`)) {
      return value.slice(1, src.length - 1);
    } else {
      return value;
    }
  }
}

function pickEntities<T>(
  sExpressionRoot: ISExpressionRoot,
  types: string | string[],
  attrsMap: Record<keyof T, string | number | [string, string]>,
) {
  return sExpressionRoot
    .filter(
      (se) =>
        se[0] === types || (Array.isArray(types) && types.includes(se[0])),
    )
    .map((se) => {
      return Object.fromEntries(
        Object.keys(attrsMap).map((key) => {
          const propName = attrsMap[key as keyof T];
          if (typeof propName === 'number') {
            const value = se[propName];
            return [key, value];
          } else if (Array.isArray(propName)) {
            const arr = (se as string[])
              ?.find((it) => it[0] === propName[0] && it[1] === propName[1])
              ?.slice(2);
            const value = arr?.length === 1 ? arr[0] : arr;
            return [key, value];
          } else {
            const arr = (se as string[])
              ?.find((it) => it[0] === propName)
              ?.slice(1);
            const value = arr?.length === 1 ? arr[0] : arr;
            return [key, value];
          }
        }),
      );
    }) as T[];
}

function tupleToPointXY(xy: [number, number]): IPoint {
  return { x: xy[0], y: xy[1] };
}

function getFootprintReferenceOrder(ref: string): number {
  const m = ref.match(/([0-9]+)$/);
  if (m) {
    return parseInt(m[1]);
  }
  return 0;
}

function extractPcbEntities(source: ISExpressionRoot): IPcbShapeData {
  if (!Array.isArray(source)) {
    throw new Error('invalid source content');
  }

  const sFootprints = pickEntities<{
    footprintName: string;
    fpTextReference: [string, any, any, any];
    at: [number, number, number];
  }>(source, ['footprint', 'module'], {
    footprintName: 1,
    fpTextReference: ['fp_text', 'reference'],
    at: 'at',
  });

  const sLines = pickEntities<{
    start: [number, number];
    end: [number, number];
    layer: string;
  }>(source, 'gr_line', {
    start: 'start',
    end: 'end',
    layer: 'layer',
  }).filter((it) => it.layer === 'Edge.Cuts');

  const sRects = pickEntities<{
    start: [number, number];
    end: [number, number];
    layer: string;
  }>(source, 'gr_rect', {
    start: 'start',
    end: 'end',
    layer: 'layer',
  }).filter((it) => it.layer === 'Edge.Cuts');

  const sCircles = pickEntities<{
    center: [number, number];
    end: [number, number];
    layer: string;
  }>(source, 'gr_circle', {
    center: 'center',
    end: 'end',
    layer: 'layer',
  }).filter((it) => it.layer === 'Edge.Cuts');

  const sArcs = pickEntities<{
    start: [number, number];
    mid?: [number, number];
    end: [number, number];
    angle?: number;
    layer: string;
  }>(source, 'gr_arc', {
    start: 'start',
    mid: 'mid',
    end: 'end',
    angle: 'angle',
    layer: 'layer',
  }).filter((it) => it.layer === 'Edge.Cuts');

  const sPolygons = pickEntities<{
    pts: ['xy', number, number][];
    layer: string;
  }>(source, 'gr_poly', {
    pts: 'pts',
    layer: 'layer',
  }).filter((it) => it.layer === 'Edge.Cuts');

  const sCurves = pickEntities<{
    pts: ['xy', number, number][];
    layer: string;
  }>(source, 'gr_curve', {
    pts: 'pts',
    layer: 'layer',
  }).filter((it) => it.layer === 'Edge.Cuts');

  const footprints = sFootprints
    .map((it) => ({
      footprintName: it.footprintName,
      referenceName: it.fpTextReference[0].toLowerCase(),
      at: {
        x: it.at[0],
        y: it.at[1],
        angle: it.at[2],
      },
    }))
    .sort(sortOrderBy((it) => getFootprintReferenceOrder(it.referenceName)));

  const lines = sLines.map((it) => ({
    type: 'grLine' as const,
    points: [tupleToPointXY(it.start), tupleToPointXY(it.end)],
  }));

  const rects = sRects.map((it) => ({
    type: 'grRect' as const,
    points: [tupleToPointXY(it.start), tupleToPointXY(it.end)],
  }));

  const circles = sCircles.map((it) => ({
    type: 'grCircle' as const,
    center: tupleToPointXY(it.center),
    radius: vectorOp.getDist(tupleToPointXY(it.center), tupleToPointXY(it.end)),
  }));

  const arcs = sArcs.map((it) => {
    if (it.angle !== undefined) {
      const ep = tupleToPointXY(it.end);
      const cp = tupleToPointXY(it.start); // center point of arc circle
      const vce = vectorOp.subtract(ep, cp);
      const sp = vectorOp.add(cp, vectorOp.rotate(vce, degToRad(it.angle)));
      const mp = vectorOp.add(cp, vectorOp.rotate(vce, degToRad(it.angle / 2)));

      const radius = vectorOp.getDist(cp, ep);
      return {
        type: 'grArc' as const,
        points: [sp, mp, ep],
        radius,
        arcFlipped: it.angle > 0,
      };
    } else if (it.mid !== undefined) {
      const sp = tupleToPointXY(it.start);
      const mp = tupleToPointXY(it.mid);
      const ep = tupleToPointXY(it.end);
      const radius = calculateCircleRadiusFrom3PointArc([sp, mp, ep]);
      return {
        type: 'grArc' as const,
        points: [sp, mp, ep],
        radius,
      };
    } else {
      throw new Error('invalid arc node');
    }
  });

  const polygons = sPolygons.map((it) => ({
    type: 'grPoly' as const,
    points: it.pts.map((pt) => ({ x: pt[1], y: pt[2] })),
  }));

  const curves = sCurves.map((it) => ({
    type: 'grCurve' as const,
    points: it.pts.map((pt) => ({ x: pt[1], y: pt[2] })),
  }));

  const paths = pathComposer_composePath([...lines, ...arcs, ...curves]);
  const outlines = [...rects, ...circles, ...polygons, ...paths];

  coordRounder_roundFootprintsCoord(footprints);
  coordRounder_roundGraphicsCoord(outlines);

  const boundingBox = calculatePcbShapeBoundingBox(
    footprints,
    outlines,
    kicadImporterConfig.shapeBoundingBoxOuterMargin,
  );
  return { footprints, outlines, boundingBox };
}

export const kicadFileContentLoader: IKicadFileContentLoader = {
  loadKicadPcbFileContent(source: string) {
    const text = source.replace(/\r?\n/g, '');
    const rawExp = readSubNodes(text);
    const exp = convertElementTypes(rawExp) as ISExpressionRoot;
    console.log({ exp });
    return extractPcbEntities(exp);
  },
};
