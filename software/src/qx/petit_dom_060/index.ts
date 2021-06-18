import { insertDom } from './dom';
import { IDirective, IRef, VNode } from './types';
import { mount, patchInPlace, DEFAULT_ENV } from './vdom';

export { h, jsx, Fragment } from './h';
export { getParentNode } from './dom';

type IRootParentDomNode = HTMLElement & {
  $$PETIT_DOM_REF?: {
    vnode: VNode;
    ref: IRef;
  };
};

export function render(
  vnode: VNode,
  parentDomNode: IRootParentDomNode,
  options: { directives?: IDirective } = {},
) {
  const rootRef = parentDomNode.$$PETIT_DOM_REF;
  const env = Object.assign({}, DEFAULT_ENV);
  Object.assign(env.directives, options.directives);
  if (!rootRef) {
    const ref = mount(vnode, env);
    parentDomNode.$$PETIT_DOM_REF = { ref, vnode };
    parentDomNode.textContent = '';
    insertDom(parentDomNode, ref, null);
  } else {
    rootRef.ref = patchInPlace(
      parentDomNode,
      vnode,
      rootRef.vnode,
      rootRef.ref,
      env,
    );
    rootRef.vnode = vnode;
  }
}
