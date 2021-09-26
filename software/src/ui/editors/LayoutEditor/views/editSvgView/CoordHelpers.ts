import { degToRad } from '~/shared';
import { editReader, IEditTransGroup } from '~/ui/editors/LayoutEditor/models';

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

// ワールド座標系での視界範囲の領域を得る
export function getWorldViewBounds() {
  const { sight } = editReader;
  const d = 1; // デバッグ用のオフセット値

  const ew = (sight.screenW / 2) * sight.scale;
  const eh = (sight.screenH / 2) * sight.scale;
  const left = -ew + sight.pos.x + d;
  const top = -eh + sight.pos.y + d;
  const right = ew + sight.pos.x - d;
  const bottom = eh + sight.pos.y - d;
  return {
    left,
    top,
    right,
    bottom,
  };
}

// 視界範囲を覆う円の配置をワールド座標系の座標単位で得る
// グループの座標変換を適用したグリッドラインの生成に使用
export function getSightBoundingCircle(group: IEditTransGroup | undefined): {
  cx: number;
  cy: number;
  radius: number;
} {
  const { sight } = editReader;
  const [cx, cy] = applyInverseGroupTransform(
    sight.pos.x,
    sight.pos.y,
    group,
    false,
  );
  const ew = (sight.screenW / 2) * sight.scale;
  const eh = (sight.screenH / 2) * sight.scale;
  const radius = Math.sqrt(ew * ew + eh * eh);

  return { cx, cy, radius };
}

export function screenCoordToGroupTransformationCoord(
  sx: number,
  sy: number,
  group: IEditTransGroup | undefined,
) {
  const [wx, wy] = screenToWorld(sx, sy);
  const [gx, gy] = applyInverseGroupTransform(wx, wy, group, false);
  return [gx, gy];
}
