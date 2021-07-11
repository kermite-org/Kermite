import { applyDomAttributes } from 'qx/qxinternal_qxcore/dom';
import { createVBlank } from 'qx/qxinternal_qxcore/jsx';
import { IProps, IVComponent, IVNode } from './types';

// ------------------------------------------------------------

// function removeDomChildren(parentDom: Node) {
//   while (parentDom.firstChild) {
//     parentDom.removeChild(parentDom.firstChild);
//   }
// }

// function cleanupDomAttributes(el: Element, vnode: IVElement) {
//   for (const key in vnode.props) {
//     const value = vnode.props[key];
//     if (key.startsWith('on') && typeof value === 'function') {
//       // (el as any)[key.toLocaleLowerCase()] = undefined;
//     }
//   }
// }

function makePropsWithChildren(props: IProps, children: IVNode[]) {
  return { ...props, children };
  // if (children.length === 1) {
  //   return { ...props, children: children[0] };
  // } else {

  // }
}

// ------------------------------------------------------------

const svgNs = 'http://www.w3.org/2000/svg';

export function mount(parentDom: Node, vnode: IVNode, isSvg = false): Node {
  console.log(`mount ${vnode.debugSig} ${(vnode as any).marker || ''}`);
  let dom: Node;
  if (vnode.vtype === 'vText') {
    dom = document.createTextNode(vnode.text);
  } else if (vnode.vtype === 'vElement') {
    isSvg ||= vnode.tagName === 'svg';
    dom = isSvg
      ? document.createElementNS(svgNs, vnode.tagName)
      : document.createElement(vnode.tagName);
    applyDomAttributes(dom as any, vnode, undefined);
    vnode.children.forEach((vnode) => mount(dom, vnode, isSvg));
  } else if (vnode.vtype === 'vComponent') {
    vnode.state.componentState = {};
    const props = makePropsWithChildren(vnode.props, vnode.children);
    const draftRes =
      vnode.componentWrapper.mount(vnode.state.componentState, props) ||
      createVBlank(null);
    vnode.state.renderRes = draftRes;
    dom = mount(parentDom, draftRes, isSvg);
  } else {
    dom = document.createComment('NULL');
  }
  parentDom.appendChild(dom);
  vnode.dom = dom as any;
  vnode.parentDom = parentDom;
  return dom;
}

// ------------------------------------------------------------

function patchFc(
  parentDom: Node,
  newVNode: IVComponent,
  oldVNode: IVComponent,
) {
  newVNode.state.componentState = oldVNode.state.componentState;
  const prevRenderRes = oldVNode.state.renderRes!;
  const props = makePropsWithChildren(newVNode.props, newVNode.children);
  const draftRes =
    newVNode.componentWrapper.update(newVNode.state.componentState, props) ||
    createVBlank(null);
  newVNode.state.renderRes = draftRes;
  if (0) {
    console.log('patch', newVNode.componentWrapper.name, {
      dom: oldVNode.dom,
      draftRes,
      prevRenderRes,
    });
  }
  patch(parentDom, draftRes, prevRenderRes);
}

// ------------------------------------------------------------

function unmount(parentDom: Node, oldVNode: IVNode) {
  if (oldVNode.vtype === 'vComponent') {
    oldVNode.componentWrapper.unmount(oldVNode.state.componentState);
  }
  parentDom.removeChild(oldVNode.dom!);
  oldVNode.dom = undefined;
  oldVNode.parentDom = undefined;
}

// ------------------------------------------------------------

function patchChildren(
  parentDom: Node,
  newVNodes: IVNode[],
  oldVNodes: IVNode[],
) {
  if (newVNodes.length === oldVNodes.length) {
    for (let i = 0; i < newVNodes.length; i++) {
      // const dom = childDomNodes[i];
      const newVNode = newVNodes[i];
      const oldVNode = oldVNodes[i];
      patch(parentDom, newVNode, oldVNode);
    }
  } else {
    // for (let i = 0; i < oldVNodes.length; i++) {
    //   const oldVNode = oldVNodes[i];
    //   unmount(oldVNode.dom!, oldVNode);
    // }
    oldVNodes.forEach((vnode) => unmount(parentDom, vnode));
    // removeDomChildren(parentDom);
    newVNodes.forEach((vnode) => mount(parentDom, vnode));
  }
}

export function patch(parentDom: Node, newVNode: IVNode, oldVNode: IVNode) {
  if (newVNode === oldVNode) {
    newVNode.dom = oldVNode.dom;
  } else if (newVNode.vtype === 'vBlank' && oldVNode.vtype === 'vBlank') {
    newVNode.dom = oldVNode.dom;
  } else if (newVNode.vtype === 'vText' && oldVNode.vtype === 'vText') {
    const dom = oldVNode.dom!;
    if (newVNode.text !== oldVNode.text) {
      dom.nodeValue = newVNode.text;
    }
    newVNode.dom = dom;
  } else if (
    newVNode.vtype === 'vComponent' &&
    oldVNode.vtype === 'vComponent' &&
    newVNode.componentWrapper === oldVNode.componentWrapper
  ) {
    patchFc(parentDom, newVNode, oldVNode);
    newVNode.dom = oldVNode.dom;
  } else if (
    oldVNode.dom instanceof Element &&
    newVNode.vtype === 'vElement' &&
    oldVNode.vtype === 'vElement' &&
    newVNode.tagName === oldVNode.tagName
  ) {
    const dom = oldVNode.dom!;
    applyDomAttributes(dom, newVNode, oldVNode);
    patchChildren(dom, newVNode.children, oldVNode.children);
    newVNode.dom = dom;
  } else {
    if (newVNode.vtype !== oldVNode.vtype) {
      unmount(parentDom, oldVNode);
      mount(parentDom, newVNode);
    } else {
      console.log('invalid condition');
    }
  }
}
