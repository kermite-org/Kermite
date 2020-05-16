import { qxGlobal } from './qxGlobal';
import { render as petitDomRender } from './qxinternal_petit_dom';
import { VNode } from './qxinternal_petit_dom/types';
export { h } from './qxinternal_petit_dom/h';

export function rerender() {
  qxGlobal.reqRerender = true;
}

export function render(
  renderFn: () => JSX.Element,
  parentDomNode: HTMLElement | null
) {
  const executeRender = () =>
    petitDomRender(renderFn() as VNode, parentDomNode!);
  qxGlobal.reqRerender = true;

  function renderLoop() {
    if (qxGlobal.reqRerender) {
      executeRender();
      qxGlobal.reqRerender = false;
    }
    requestAnimationFrame(renderLoop);
  }
  renderLoop();
}
