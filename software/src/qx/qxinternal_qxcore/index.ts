import { mount, patch } from 'qx/qxinternal_qxcore/qxcore';
import { IVNode } from 'qx/qxinternal_qxcore/types';

export { IVNode as VNode } from './types';
export { jsx, Fragment } from './jsx';

let prevVDom: IVNode;

export function render(vnode: IVNode, rootDom: Element | null) {
  if (!prevVDom) {
    mount(rootDom!, vnode);
  } else {
    patch(rootDom!, vnode, prevVDom);
  }
  prevVDom = vnode;
}
