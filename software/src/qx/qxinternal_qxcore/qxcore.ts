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

export function mount(parentDom: Node, vnode: IVNode): Node {
  let dom: Node;
  if (vnode.vtype === 'vText') {
    dom = document.createTextNode(vnode.text);
  } else if (vnode.vtype === 'vElement') {
    dom = document.createElement(vnode.tagName);
    applyDomAttributes(dom as any, vnode, undefined);
    vnode.children.forEach((vnode) => mount(dom, vnode));
  } else if (vnode.vtype === 'vComponent') {
    vnode.state.componentState = {};
    const props = makePropsWithChildren(vnode.props, vnode.children);
    const draftRes =
      vnode.componentWrapper.mount(vnode.state.componentState, props) ||
      createVBlank(null);
    vnode.state.renderRes = draftRes;
    dom = mount(parentDom, draftRes);
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
  dom: Node,
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
  if (1) {
    console.log('patch', newVNode.componentWrapper.name, {
      dom,
      draftRes,
      prevRenderRes,
    });
  }
  patch(parentDom, dom, draftRes, prevRenderRes);
}

// ------------------------------------------------------------

function unmount(parentDom: Node, vnode: IVNode) {
  if (vnode.vtype === 'vComponent') {
    vnode.componentWrapper.unmount(vnode.state.componentState);
  }
  parentDom.removeChild(vnode.dom!);
  vnode.dom = undefined;
  vnode.parentDom = undefined;
}

// ------------------------------------------------------------

function patchChildren(
  parentDom: Node,
  newVNodes: IVNode[],
  oldVNodes: IVNode[],
) {
  // const childDomNodes = Array.from(parentDom.childNodes);

  // if (childDomNodes.length !== oldVNodes.length) {
  //   debugger;
  // }

  if (newVNodes.length === oldVNodes.length && false) {
    for (let i = 0; i < newVNodes.length; i++) {
      // const dom = childDomNodes[i];
      const newVNode = newVNodes[i];
      const oldVNode = oldVNodes[i];
      const dom = oldVNode.dom!;
      patch(parentDom, dom, newVNode, oldVNode);
      newVNode.dom = dom;
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

export function patch(
  parentDom: Node,
  dom: Node,
  newVNode: IVNode,
  oldVNode: IVNode,
) {
  if (newVNode === oldVNode) {
  } else if (newVNode.vtype === 'vBlank' && oldVNode.vtype === 'vBlank') {
  } else if (newVNode.vtype === 'vText' && oldVNode.vtype === 'vText') {
    if (newVNode.text !== oldVNode.text) {
      dom.nodeValue = newVNode.text;
    }
  } else if (
    newVNode.vtype === 'vComponent' &&
    oldVNode.vtype === 'vComponent' &&
    newVNode.componentWrapper === oldVNode.componentWrapper
  ) {
    patchFc(parentDom, dom, newVNode, oldVNode);
  } else if (
    dom instanceof Element &&
    newVNode.vtype === 'vElement' &&
    oldVNode.vtype === 'vElement' &&
    newVNode.tagName === oldVNode.tagName
  ) {
    applyDomAttributes(dom, newVNode, oldVNode);
    patchChildren(dom, newVNode.children, oldVNode.children);
  } else {
    if (newVNode.vtype !== oldVNode.vtype) {
      unmount(parentDom, oldVNode);
      mount(parentDom, newVNode);
    } else {
      console.log('invalid condition');
    }
  }
}
