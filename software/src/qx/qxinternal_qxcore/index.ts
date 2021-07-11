import { mount, patch } from 'qx/qxinternal_qxcore/qxcore';
import { IVNode } from 'qx/qxinternal_qxcore/types';

export { IVNode as VNode } from './types';
export { jsx } from './jsx';

let prevDom: Node;
let prevVDom: IVNode;

export function render(vnode: IVNode, rootDom: Element | null) {
  if (!prevDom) {
    prevDom = mount(rootDom!, vnode);
  } else {
    patch(prevDom, vnode, prevVDom);
  }
  prevVDom = vnode;
}
