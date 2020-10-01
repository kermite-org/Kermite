import { mount, patch, unmount } from './vdom';
import { VNode } from './types';
export { h } from './h';
export { mount, patch, unmount } from './vdom';

type IParentDomNode = Element & {
  $$petitDomState$$?: {
    vnode: VNode;
    domNode: Node;
  };
};

export function render(vnode: VNode, parentDomNode: IParentDomNode) {
  const state = parentDomNode.$$petitDomState$$;
  let domNode;
  if (!state) {
    domNode = mount(vnode);
    parentDomNode.appendChild(domNode);
  } else {
    domNode = patch(vnode, state.vnode, state.domNode);
    if (domNode !== state.domNode) {
      parentDomNode.replaceChild(domNode, state.domNode);
      unmount(state.vnode, state.domNode);
    }
  }
  parentDomNode.$$petitDomState$$ = { vnode, domNode };
}
