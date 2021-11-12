import { interactivePropKeys, svgNs } from 'qx/qxinternal_qxcore/constants';
import { applyDomAttributes } from 'qx/qxinternal_qxcore/dom';
import { createVBlank } from 'qx/qxinternal_qxcore/jsx';
import { IVComponent, IVNode } from 'qx/qxinternal_qxcore/types';

function assert(cond: any) {
  if (!cond) {
    console.log('assertion failed');
  }
}

// ------------------------------------------------------------

export function mount(
  parentDom: Node,
  vnode: IVNode,
  insertBeforeTarget: Node | null = null,
): Node {
  let dom: Node;
  if (vnode.vtype === 'vBlank') {
    dom = document.createComment('NULL');
    parentDom.insertBefore(dom, insertBeforeTarget);
  } else if (vnode.vtype === 'vText') {
    dom = document.createTextNode(vnode.text);
    parentDom.insertBefore(dom, insertBeforeTarget);
  } else if (vnode.vtype === 'vElement') {
    const isSvg = vnode.tagName === 'svg' || parentDom instanceof SVGElement;
    dom = isSvg
      ? document.createElementNS(svgNs, vnode.tagName)
      : document.createElement(vnode.tagName);
    applyDomAttributes(dom as any, vnode, undefined);
    vnode.children.forEach((vnode) => mount(dom, vnode));
    const refProp = vnode.props.ref;
    if (refProp && typeof refProp === 'object') {
      refProp.current = dom;
    }
    parentDom.insertBefore(dom, insertBeforeTarget);

    interactivePropKeys.forEach((key) => {
      const value = vnode.props[key];
      if (value !== undefined) {
        (dom as any)[key] = value;
      }
    });
  } else if (vnode.vtype === 'vComponent') {
    // console.log(`mount-fc ${vnode.debugSig} ${(vnode as any).marker || ''}`);
    vnode.state.componentState = {} as any;
    const renderRes =
      vnode.componentWrapper.mount(
        vnode.state.componentState as any,
        vnode.props,
      ) || createVBlank(null);
    vnode.state.renderRes = renderRes;
    dom = mount(parentDom, renderRes, insertBeforeTarget);
  } else if (vnode.vtype === 'vFragment') {
    dom = parentDom;
    vnode.children.forEach((vnode) => mount(dom, vnode, insertBeforeTarget));
  } else {
    throw new Error(`invalid vnode ${vnode}`);
  }
  vnode.dom = dom as any;
  return dom;
}

// ------------------------------------------------------------

function unmount(parentDom: Node, oldVNode: IVNode) {
  if (oldVNode.vtype === 'vBlank') {
    parentDom.removeChild(oldVNode.dom!);
  } else if (oldVNode.vtype === 'vText') {
    parentDom.removeChild(oldVNode.dom!);
  } else if (oldVNode.vtype === 'vElement') {
    const dom = oldVNode.dom!;
    oldVNode.children.forEach((vnode) => unmount(dom, vnode));
    parentDom.removeChild(dom);
  } else if (oldVNode.vtype === 'vComponent') {
    unmount(parentDom, oldVNode.state.renderRes!);
    oldVNode.state.renderRes = undefined;
    oldVNode.componentWrapper.unmount(oldVNode.state.componentState!);
  } else if (oldVNode.vtype === 'vFragment') {
    const dom = oldVNode.dom!;
    oldVNode.children.forEach((vnode) => unmount(dom, vnode));
  } else {
    throw new Error(`invalid vnode ${oldVNode}`);
  }
  oldVNode.dom = undefined;
}

// ------------------------------------------------------------

function patchFc(
  parentDom: Node,
  newVNode: IVComponent,
  oldVNode: IVComponent,
) {
  // console.log(
  //   `patch-fc ${newVNode.debugSig} ${(newVNode as any).marker || ''}`,
  // );
  newVNode.state.componentState = oldVNode.state.componentState;
  const oldRenderRes = oldVNode.state.renderRes!;
  const renderRes =
    newVNode.componentWrapper.update(
      newVNode.state.componentState!,
      newVNode.props,
    ) || createVBlank(null);
  newVNode.state.renderRes = renderRes;
  // console.log('patch', newVNode.componentWrapper.name, {
  //   dom: oldVNode.dom,
  //   renderRes,
  //   oldRenderRes,
  // });
  patch(parentDom, renderRes, oldRenderRes);
}

// ------------------------------------------------------------

function patchChildren(
  parentDom: Node,
  newVNodes: IVNode[],
  oldVNodes: IVNode[],
) {
  // 現状diff/patchに実装コストをかけていない
  // 将来パフォーマンスが問題になる場合にはここを改善する必要がある
  if (newVNodes.length === oldVNodes.length) {
    for (let i = 0; i < newVNodes.length; i++) {
      const newVNode = newVNodes[i];
      const oldVNode = oldVNodes[i];
      patch(parentDom, newVNode, oldVNode);
    }
  } else {
    oldVNodes.forEach((vnode) => unmount(parentDom, vnode));
    newVNodes.forEach((vnode) => mount(parentDom, vnode));
  }
}

export function patch(parentDom: Node, newVNode: IVNode, oldVNode: IVNode) {
  assert(parentDom && newVNode && oldVNode);
  assert(oldVNode.dom);
  assert(!Array.isArray(newVNode));

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
    interactivePropKeys.forEach((key) => {
      const oldValue = oldVNode.props[key];
      const newValue = newVNode.props[key];
      // value,selected,chekedの値が変わったとき
      // selectなどで子要素の数が変わったとき
      // に、値を更新する
      if (
        newValue !== oldValue ||
        newVNode.children.length !== oldVNode.children.length
      ) {
        (dom as any)[key] = newValue;
      }
    });
  } else if (newVNode.vtype === 'vFragment' && oldVNode.vtype === 'vFragment') {
    const dom = oldVNode.dom!;
    patchChildren(dom, newVNode.children, oldVNode.children);
    newVNode.dom = dom;
  } else if (
    newVNode.vtype !== oldVNode.vtype ||
    (oldVNode.vtype === 'vElement' &&
      newVNode.vtype === 'vElement' &&
      oldVNode.tagName !== newVNode.tagName) ||
    (oldVNode.vtype === 'vComponent' &&
      newVNode.vtype === 'vComponent' &&
      newVNode.componentWrapper !== oldVNode.componentWrapper)
  ) {
    let nextSibling = oldVNode.dom?.nextSibling || null;
    if (oldVNode.vtype === 'vFragment') {
      nextSibling =
        oldVNode.children[oldVNode.children.length - 1].dom?.nextSibling ||
        null;
    }
    unmount(parentDom, oldVNode);
    mount(parentDom, newVNode, nextSibling);
  } else {
    console.log('invalid condition');
  }
}
