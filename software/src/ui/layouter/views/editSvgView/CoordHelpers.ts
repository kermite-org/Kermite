import { degToRad } from '~/shared';
import { editReader, IEditTransGroup } from '~/ui/layouter/models';

export function screenToWorld(sx: number, sy: number): [x: number, y: number] {
  const { sight } = editReader;
  const x = (sx - sight.screenW / 2) * sight.scale + sight.pos.x;
  const y = (sy - sight.screenH / 2) * sight.scale + sight.pos.y;
  return [x, y];
}

export function getWorldMousePositionOnEditSvg(
  e: MouseEvent,
): [x: number, y: number] {
  const svg = (e.currentTarget as SVGPolygonElement).closest('svg')!;
  const bounds = svg.getBoundingClientRect();
  const sx = e.pageX - bounds.left;
  const sy = e.pageY - bounds.top;
  return screenToWorld(sx, sy);
}

export function applyInverseGroupTransform(
  wx: number,
  wy: number,
  group: IEditTransGroup | undefined,
  isMirror: boolean,
) {
  const mirrorMultX = isMirror ? -1 : 1;
  const ox = group?.x || 0;
  const oy = group?.y || 0;
  const theta = -degToRad(group?.angle || 0) * mirrorMultX;
  const m0x = wx - ox * mirrorMultX;
  const m0y = wy - oy;
  const mx = m0x * Math.cos(theta) - m0y * Math.sin(theta);
  const my = m0x * Math.sin(theta) + m0y * Math.cos(theta);
  return [mx, my];
}

export function getGroupOuterSvgTransformSpec(
  groupId: string | undefined,
  isMirror: boolean,
): string {
  const group = editReader.getTransGroupById(groupId || '');
  const ox = group?.x || 0;
  const oy = group?.y || 0;
  const orot = group?.angle || 0;
  const mirrorMultX = isMirror ? -1 : 1;
  return `scale(${mirrorMultX}, 1) translate(${ox}, ${oy}) rotate(${orot})`;
}
