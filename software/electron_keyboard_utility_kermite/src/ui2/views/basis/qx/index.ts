import { qxGlobal } from './qxGlobal';
import { render as petitDomRender } from './qxinternal_petit_dom';
import { VNode } from './qxinternal_petit_dom/types';
export { h } from './qxinternal_petit_dom/h';

export function rerender() {
  qxGlobal.rerender();
}

export function render(
  renderFn: () => JSX.Element,
  parentDomNode: HTMLElement | null
) {
  const executeRender = () => {
    // console.log(`--------render start--------`);
    const d = qxGlobal.debug;
    d.nAll = 0;
    d.nUpdated = 0;
    d.nPatchCall = 0;
    const t0 = performance.now();
    petitDomRender(renderFn() as VNode, parentDomNode!);
    const t1 = performance.now();
    const dur = t1 - t0;
    const nel = document.getElementsByTagName('*').length;
    console.log(
      `render c${d.nUpdated}/${d.nAll}, ` +
        `p${d.nPatchCall}, n${nel}, ${dur.toFixed(2)}ms`
    );
    //render stats
    //c: component patched count,
    //p: component/z--zizia0zia0zia00aizzia0zia0zi00aizzia0zi0azia00aizzia0zia0zia0element patch count
    //n: dom nodes count
    //ms: time elapsed
  };

  qxGlobal.rerender = executeRender;
  executeRender();
}
