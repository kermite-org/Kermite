import { asyncRerender, rerender } from 'alumina';

export function getRelativeMousePosition(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement;
  const bounds = el.getBoundingClientRect();
  const sx = e.pageX - bounds.left;
  const sy = e.pageY - bounds.top;
  return [sx, sy];
}

export interface IPosition {
  x: number;
  y: number;
}

export function startDragSession(
  sourceEvent: MouseEvent,
  moveCallback: (pos: IPosition, prevPos: IPosition) => void,
  upCallback: () => void,
) {
  let prevPos = { x: sourceEvent.clientX, y: sourceEvent.clientY };

  const onMouseMove = (e: MouseEvent) => {
    const pos = { x: e.clientX, y: e.clientY };
    moveCallback(pos, prevPos);
    prevPos = pos;
    asyncRerender();
  };

  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    upCallback();
    rerender();
  };

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}
