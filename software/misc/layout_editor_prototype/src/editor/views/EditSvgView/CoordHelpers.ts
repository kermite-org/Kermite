import { editReader } from '~/editor/store';

export function screenToWorld(sx: number, sy: number): [x: number, y: number] {
  const { sight } = editReader;
  const x = (sx - sight.screenW / 2) * sight.scale + sight.pos.x;
  const y = (sy - sight.screenH / 2) * sight.scale + sight.pos.y;
  return [x, y];
}

export function getWorldMousePositionOnEditSvg(
  e: MouseEvent
): [x: number, y: number] {
  const svg = (e.currentTarget as SVGPolygonElement).closest('svg')!;
  const bounds = svg.getBoundingClientRect();
  const sx = e.pageX - bounds.left;
  const sy = e.pageY - bounds.top;
  return screenToWorld(sx, sy);
}
