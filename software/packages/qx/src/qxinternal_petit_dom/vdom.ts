import { qxGlobal } from '../qxGlobal';
import { diff, INSERTION, DELETION, PATCH } from './diff';
import { isVNull, isVLeaf, isVElement, isVComponent } from './h';
import { VNode, IEnv } from './types';
import { indexOf } from './utils';

const SVG_NS = 'http://www.w3.org/2000/svg';
const INTERACTIVE_PROPS = {
  selected: true,
  value: true,
  checked: true,
  innerHTML: true,
};
/**
  TODO: activate full namespaced attributes (not supported in JSX)
  const XML_NS = "http://www.w3.org/XML/1998/namespace"
**/
const XLINK_NS = 'http://www.w3.org/1999/xlink';
const NS_ATTRS: { [key: string]: string } = {
  show: XLINK_NS,
  actuate: XLINK_NS,
  href: XLINK_NS,
};

const DEFAULT_ENV: IEnv = {
  isSvg: false,
};

export function mount(vnode: VNode, env: IEnv = DEFAULT_ENV): Node {
  if (isVNull(vnode)) {
    return document.createComment('NULL');
  } else if (isVLeaf(vnode)) {
    return document.createTextNode(String(vnode));
  } else if (isVElement(vnode)) {
    let node;
    const { type, props, children } = vnode;
    if (type === 'svg' && !env.isSvg) {
      env = Object.assign({}, env, { isSvg: true });
    }
    // TODO : {is} for custom elements
    if (!env.isSvg) {
      node = document.createElement(type);
    } else {
      node = document.createElementNS(SVG_NS, type);
    }
    const delayedProps = setAttributes(
      node,
      props,
      undefined,
      env.isSvg || false,
    );
    mountChildren(node, children, 0, children.length - 1, null, env);
    if (delayedProps) {
      setProps(node, props, undefined, delayedProps);
    }
    return node;
  } else if (isVComponent(vnode)) {
    vnode._state = {};
    return vnode.type.mount(vnode.props, vnode._state, env);
  }
  if (vnode === undefined) {
    throw new Error('mount: vnode is undefined!');
  }

  throw new Error('mount: Invalid Vnode!');
}

export function patch(
  newVNode: VNode,
  oldVNode: VNode,
  domNode: Node,
  env: IEnv = DEFAULT_ENV,
): Node {
  qxGlobal.debug.nPatchCall++;

  if (oldVNode === newVNode) {
    return domNode;
  } else if (isVNull(newVNode) && isVNull(oldVNode)) {
    return domNode;
  } else if (isVLeaf(newVNode) && isVLeaf(oldVNode)) {
    domNode.nodeValue = String(newVNode);
    return domNode;
  } else if (
    isVElement(newVNode) &&
    isVElement(oldVNode) &&
    newVNode.type === oldVNode.type
  ) {
    if (newVNode.type === 'svg' && !env.isSvg) {
      env = Object.assign({}, env, { isSvg: true });
    }
    const delayedProps = setAttributes(
      domNode as Element,
      newVNode.props,
      oldVNode.props,
      env.isSvg || false,
    );

    patchChildren(domNode, newVNode.children, oldVNode.children, env);
    if (delayedProps) {
      setProps(domNode, newVNode.props, oldVNode.props, delayedProps);
    }
    return domNode;
  } else if (
    isVComponent(newVNode) &&
    isVComponent(oldVNode) &&
    newVNode.type === oldVNode.type
  ) {
    newVNode._state = oldVNode._state;
    return newVNode.type.patch(
      newVNode.props,
      oldVNode.props,
      newVNode._state,
      domNode,
      env,
    );
  } else {
    return mount(newVNode, env);
  }
}

export function unmount(vnode: VNode, domNode: Node, env?: IEnv) {
  if (isVNull(vnode) || isVLeaf(vnode)) {
    return;
  }
  if (isVElement(vnode)) {
    for (let i = 0; i < vnode.children.length; i++) {
      if (domNode.childNodes[i]) {
        unmount(vnode.children[i], domNode.childNodes[i], env);
      }
    }
  } else if (isVComponent(vnode)) {
    vnode.type.unmount(vnode._state, domNode, env);
  }
}

function mountChildren(
  parentDomNode: Node,
  vnodes: VNode[],
  // eslint-disable-next-line @typescript-eslint/default-param-last
  start: number = 0,
  // eslint-disable-next-line @typescript-eslint/default-param-last
  end: number = vnodes.length - 1,
  beforeNode: Node | null,
  env: IEnv,
) {
  while (start <= end) {
    const vnode = vnodes[start++];
    parentDomNode.insertBefore(mount(vnode, env), beforeNode);
  }
}

function setProps(
  el: { [key: string]: any },
  props: { [key: string]: any },
  oldProps: { [key: string]: any } | undefined,
  keys: string[],
) {
  let key;
  for (let i = 0; i < keys.length; i++) {
    key = keys[i];
    const oldv = oldProps?.[key];
    const newv = props[key];
    if (oldv !== newv) {
      el[key] = newv;
    }
  }
}

function setAttributes(
  domElement: Element,
  newAttrs: { [key: string]: string },
  oldAttrs: { [key: string]: string } | undefined,
  isSvg: boolean,
) {
  const props = [];
  for (const key in newAttrs) {
    if (key.startsWith('on') || INTERACTIVE_PROPS.hasOwnProperty(key)) {
      props.push(key);
      continue;
    }
    const oldValue = oldAttrs ? oldAttrs[key] : undefined;
    const newValue = newAttrs[key];
    if (oldValue !== newValue) {
      setDOMAttribute(domElement, key, newValue, isSvg);
    }
  }
  for (const key in oldAttrs) {
    if (!(key in newAttrs)) {
      domElement.removeAttribute(key);
    }
  }
  if (props.length > 0) {
    return props;
  }
}

function setDOMAttribute(
  el: Element,
  attr: string,
  value: boolean | string,
  isSvg: boolean,
) {
  if (value === true) {
    el.setAttribute(attr, '');
  } else if (value === false) {
    el.removeAttribute(attr);
  } else {
    const namespace = isSvg ? NS_ATTRS[attr] : undefined;
    if (namespace !== undefined) {
      el.setAttributeNS(namespace, attr, value);
    } else {
      el.setAttribute(attr, value);
    }
  }
}

function removeChildren(
  parentDomNode: Node,
  childDomNodes: Node[],
  children: VNode[],
  start: number = 0,
  end: number = children.length - 1,
) {
  let cleared;
  if (childDomNodes.length === end - start + 1) {
    parentDomNode.textContent = '';
    cleared = true;
  }
  while (start <= end) {
    const vnode = children[start];
    const domNode = childDomNodes[start];
    if (!cleared) parentDomNode.removeChild(domNode);
    start++;
    unmount(vnode, domNode);
  }
}

function patchInPlace(
  newVNode: VNode,
  oldVNode: VNode,
  parentDomNode: Node,
  childDomNodes: Node[],
  index: number,
  env: IEnv,
) {
  const oldDomNode = childDomNodes[index];
  const newDomNode = patch(newVNode, oldVNode, oldDomNode, env);
  if (newDomNode !== oldDomNode) {
    childDomNodes[index] = newDomNode;
    parentDomNode.replaceChild(newDomNode, oldDomNode);
    unmount(oldVNode, oldDomNode, env);
  }
  return newDomNode;
}

function canPatch(newVNode: VNode, oldVNode?: VNode) {
  const newKey = newVNode?.key || null;
  const oldKey = oldVNode?.key || null;
  return newKey === oldKey;
}

function patchChildren(
  parentDomNode: Node,
  newChildren: VNode[],
  oldChildren: VNode[],
  env: IEnv,
) {
  if (newChildren === oldChildren) return;
  let newStart = 0;
  let newEnd = newChildren.length - 1;
  let oldStart = 0;
  let oldEnd = oldChildren.length - 1;
  let newVNode, oldVNode, domNode;

  if (parentDomNode === undefined) {
    console.log(`parentDomNode undefined @patchInPlace`);
    console.log({ newChildren, oldChildren, env });
  }
  const childDomNodes = Array.from(parentDomNode.childNodes);

  /**
    Before applying the diff algorithm we try some preprocessing optimizations
    to reduce the cost
    See https://neil.fraser.name/writing/diff/ for the full details.

    In the following : indel = INsertion/DELetion
  **/

  // common prefix/suffix

  while (newStart <= newEnd && oldStart <= oldEnd) {
    newVNode = newChildren[newStart];
    oldVNode = oldChildren[oldStart];

    if (canPatch(newVNode, oldVNode)) {
      patchInPlace(
        newVNode,
        oldVNode,
        parentDomNode,
        childDomNodes,
        oldStart,
        env,
      );
      newStart++;
      oldStart++;
      continue;
    }
    oldVNode = oldChildren[oldEnd];
    newVNode = newChildren[newEnd];
    if (canPatch(newVNode)) {
      patchInPlace(
        newVNode,
        oldVNode,
        parentDomNode,
        childDomNodes,
        oldEnd,
        env,
      );
      oldEnd--;
      newEnd--;
      continue;
    }
    break;
  }

  if (newStart > newEnd && oldStart > oldEnd) return;

  // simple indel: one of the 2 sequences is empty after common prefix/suffix removal

  // old sequence is empty -> insertion
  if (newStart <= newEnd && oldStart > oldEnd) {
    mountChildren(
      parentDomNode,
      newChildren,
      newStart,
      newEnd,
      childDomNodes[oldStart],
      env,
    );
    return;
  }

  // new sequence is empty -> deletion
  if (oldStart <= oldEnd && newStart > newEnd) {
    removeChildren(parentDomNode, childDomNodes, oldChildren, oldStart, oldEnd);
    return;
  }

  // 2 simple indels: the shortest sequence is a subsequence of the longest
  const oldRemaining = oldEnd - oldStart + 1;
  const newRemaining = newEnd - newStart + 1;
  let k = -1;
  if (oldRemaining < newRemaining) {
    k = indexOf(
      newChildren,
      oldChildren,
      newStart,
      newEnd,
      oldStart,
      oldEnd,
      canPatch,
    );
    if (k >= 0) {
      mountChildren(
        parentDomNode,
        newChildren,
        newStart,
        k - 1,
        childDomNodes[oldStart],
        env,
      );
      const upperLimit = k + oldRemaining;
      newStart = k;
      while (newStart < upperLimit) {
        patchInPlace(
          newChildren[newStart],
          oldChildren[oldStart],
          parentDomNode,
          childDomNodes,
          oldStart,
          env,
        );
        newStart++;
        oldStart++;
      }
      oldEnd++;
      mountChildren(
        parentDomNode,
        newChildren,
        newStart,
        newEnd,
        childDomNodes[oldEnd],
        env,
      );
      return;
    }
  } else if (oldRemaining > newRemaining) {
    k = indexOf(
      oldChildren,
      newChildren,
      oldStart,
      oldEnd,
      newStart,
      newEnd,
      canPatch,
    );
    if (k >= 0) {
      removeChildren(
        parentDomNode,
        childDomNodes,
        oldChildren,
        oldStart,
        k - 1,
      );
      const upperLimit = k + newRemaining;
      oldStart = k;
      while (oldStart < upperLimit) {
        patchInPlace(
          newChildren[newStart],
          oldChildren[oldStart],
          parentDomNode,
          childDomNodes,
          oldEnd,
          env,
        );
        newStart++;
        oldStart++;
      }
      removeChildren(
        parentDomNode,
        childDomNodes,
        oldChildren,
        oldStart,
        oldEnd,
      );
      return;
    }
  }

  // fast case: difference between the 2 sequences is only one item
  if (oldStart === oldEnd) {
    domNode = childDomNodes[oldStart];
    mountChildren(
      parentDomNode,
      newChildren,
      newStart,
      newEnd,
      childDomNodes[oldStart],
      env,
    );
    parentDomNode.removeChild(domNode);
    unmount(oldChildren[oldStart], domNode, env);
    return;
  }
  if (newStart === newEnd) {
    parentDomNode.insertBefore(
      mount(newChildren[newStart], env),
      childDomNodes[oldStart],
    );
    removeChildren(parentDomNode, childDomNodes, oldChildren, oldStart, oldEnd);
    return;
  }

  const diffResult = diff(
    newChildren,
    oldChildren,
    canPatch,
    newStart,
    newEnd,
    oldStart,
    oldEnd,
  );
  applyDiff(
    parentDomNode,
    childDomNodes,
    diffResult,
    newChildren,
    oldChildren,
    newStart,
    oldStart,
    env,
  );
}

function applyDiff(
  parentDomNode: Node,
  childDomNodes: Node[],
  { diff, deleteMap }: any,
  newChildren: VNode[],
  oldChildren: VNode[],
  newStart: number,
  oldStart: number,
  env: IEnv,
) {
  let newVNode, oldVNode, domNode, oldMatchIndex;

  for (
    let i = 0, newIndex = newStart, oldIndex = oldStart;
    i < diff.length;
    i++
  ) {
    const op = diff[i];
    if (op === PATCH) {
      patchInPlace(
        newChildren[newIndex],
        oldChildren[oldIndex],
        parentDomNode,
        childDomNodes,
        oldIndex,
        env,
      );
      newIndex++;
      oldIndex++;
    } else if (op === INSERTION) {
      newVNode = newChildren[newIndex];
      if (newVNode.key) {
        oldMatchIndex = deleteMap[newVNode.key];
      } else {
        oldMatchIndex = null;
      }
      if (oldMatchIndex) {
        domNode = patch(
          newVNode,
          oldChildren[oldMatchIndex],
          childDomNodes[oldMatchIndex],
          env,
        );
        // we use undefined to mark moved vnodes, we cant use null because
        // null is a valid VNode
        oldChildren[oldMatchIndex] = undefined!;
      } else {
        domNode = mount(newVNode, env);
      }
      parentDomNode.insertBefore(domNode, childDomNodes[oldIndex]);
      newIndex++;
    } else if (op === DELETION) {
      oldIndex++;
    }
  }

  for (let i = 0, oldIndex = oldStart; i < diff.length; i++) {
    const op = diff[i];
    if (op === PATCH) {
      oldIndex++;
    } else if (op === DELETION) {
      oldVNode = oldChildren[oldIndex];
      domNode = childDomNodes[oldIndex];
      if (oldVNode !== undefined) {
        parentDomNode.removeChild(domNode);
        unmount(oldVNode, domNode, env);
      }
      oldIndex++;
    }
  }
}
