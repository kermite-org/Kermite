/* eslint-disable eqeqeq */
import {
  SVG_NS,
  DOM_PROPS_DIRECTIVES,
  insertDom,
  replaceDom,
  removeDom,
  getDomNode,
  getNextSibling,
  mountAttributes,
  mountDirectives,
  patchDirectives,
  unmountDirectives,
  patchAttributes,
  getParentNode,
} from './dom';
import {
  isEmpty,
  isLeaf,
  isElement,
  isComponent,
  isNonEmptyArray,
  isRenderFunction,
} from './h';
import {
  IEnv,
  IProps,
  IRef,
  IRenderer,
  IRendererState,
  REF_ARRAY,
  REF_PARENT,
  REF_SINGLE,
  VNode,
} from './types';

export const DEFAULT_ENV = {
  isSvg: false,
  directives: DOM_PROPS_DIRECTIVES,
};

class Renderer implements IRenderer {
  oldProps?: IProps;
  props: IProps;
  _STATE_: IRendererState;

  constructor(props: IProps, env: IEnv) {
    this.props = props;
    this._STATE_ = {
      env,
      vnode: null,
      parentDomNode: null,
      ref: mount(null),
    };
    this.render = this.render.bind(this);
  }

  setProps(props: IProps) {
    this.oldProps = this.props;
    this.props = props;
  }

  render(vnode: VNode) {
    const state = this._STATE_;
    const oldVNode = state.vnode;
    state.vnode = vnode;
    if (state.parentDomNode == null) {
      const parentNode = getParentNode(state.ref);
      if (parentNode == null) {
        state.ref = mount(vnode, state.env);
        return;
      } else {
        state.parentDomNode = parentNode as Element;
      }
    }
    // here we're sure state.parentDOMNode is defined
    state.ref = patchInPlace(
      state.parentDomNode,
      vnode,
      oldVNode,
      state.ref,
      state.env,
    );
  }
}

export function mount(vnode: VNode, env: IEnv = DEFAULT_ENV): IRef {
  // console.log("mount", { vnode });
  if (isEmpty(vnode)) {
    return {
      type: REF_SINGLE,
      node: document.createComment('NULL'),
    };
  } else if (isLeaf(vnode)) {
    return {
      type: REF_SINGLE,
      node: document.createTextNode(vnode),
    };
  } else if (isElement(vnode)) {
    let node;
    const { type, props } = vnode;
    if (type === 'svg' && !env.isSvg) {
      env = Object.assign({}, env, { isSvg: true });
    }
    // TODO : {is} for custom elements
    if (!env.isSvg) {
      node = document.createElement(type);
    } else {
      node = document.createElementNS(SVG_NS, type);
    }
    mountAttributes(node, props, env);
    const childrenRef =
      props.children == null ? props.children : mount(props.children, env);
    /**
     * We need to insert content before setting interactive props
     * that rely on children been present (e.g select)
     */
    if (childrenRef != null) insertDom(node, childrenRef, null);
    mountDirectives(node, props, env);
    return {
      type: REF_SINGLE,
      node,
      children: childrenRef,
    };
  } else if (isNonEmptyArray(vnode)) {
    return {
      type: REF_ARRAY,
      children: vnode.map((child) => mount(child, env)),
    };
  } else if (isRenderFunction(vnode)) {
    const childVNode = vnode.type(vnode.props);
    const childRef = mount(childVNode, env);
    return {
      type: REF_PARENT,
      childRef,
      childState: childVNode,
    };
  } else if (isComponent(vnode)) {
    const renderer = new Renderer(vnode.props, env);
    vnode.type.mount(renderer);
    return {
      type: REF_PARENT,
      childRef: renderer._STATE_.ref,
      childState: renderer,
    };
  } else if ((vnode as any) instanceof Node) {
    return {
      type: REF_SINGLE,
      node: vnode as any,
    };
  }
  if (vnode === undefined) {
    throw new Error('mount: vnode is undefined!');
  }
  throw new Error('mount: Invalid Vnode!');
}

export function patch(
  parentDomNode: Element,
  newVNode: VNode,
  oldVNode: VNode,
  ref: any,
  env: IEnv = DEFAULT_ENV,
): IRef {
  if (oldVNode === newVNode) {
    return ref;
  } else if (isEmpty(newVNode) && isEmpty(oldVNode)) {
    return ref;
  } else if (isLeaf(newVNode) && isLeaf(oldVNode)) {
    ref.node.nodeValue = newVNode;
    return ref;
  } else if (
    isElement(newVNode) &&
    isElement(oldVNode) &&
    newVNode.type === oldVNode.type
  ) {
    if (newVNode.type === 'svg' && !env.isSvg) {
      env = Object.assign({}, env, { isSvg: true });
    }
    patchAttributes(ref.node, newVNode.props, oldVNode.props, env);
    const oldChildren = oldVNode.props.children;
    const newChildren = newVNode.props.children;
    if (oldChildren == null) {
      if (newChildren != null) {
        ref.children = mount(newChildren, env);
        insertDom(ref.node, ref.children, null);
      }
    } else {
      if (newChildren == null) {
        ref.node.textContent = '';
        unmount(oldChildren, ref.children, env);
        ref.children = null;
      } else {
        ref.children = patchInPlace(
          ref.node,
          newChildren,
          oldChildren,
          ref.children,
          env,
        );
      }
    }
    patchDirectives(ref.node, newVNode.props, oldVNode.props, env);
    return ref;
  } else if (isNonEmptyArray(newVNode) && isNonEmptyArray(oldVNode)) {
    patchChildren(parentDomNode, newVNode, oldVNode, ref, env);
    return ref;
  } else if (
    isRenderFunction(newVNode) &&
    isRenderFunction(oldVNode) &&
    newVNode.type === oldVNode.type
  ) {
    const renderFn = newVNode.type;
    const shouldUpdate =
      renderFn.shouldUpdate != null
        ? renderFn.shouldUpdate(oldVNode.props, newVNode.props)
        : defaultShouldUpdate(oldVNode.props, newVNode.props);
    if (shouldUpdate) {
      const childVNode = renderFn(newVNode.props);
      const childRef = patch(
        parentDomNode,
        childVNode,
        ref.childState,
        ref.childRef,
        env,
      );
      // We need to return a new ref in order for parent patches to
      // properly replace changing DOM nodes
      if (childRef !== ref.childRef) {
        return {
          type: REF_PARENT,
          childRef,
          childState: childVNode,
        };
      } else {
        ref.childState = childVNode;
        return ref;
      }
    } else {
      return ref;
    }
  } else if (
    isComponent(newVNode) &&
    isComponent(oldVNode) &&
    newVNode.type === oldVNode.type
  ) {
    const renderer = ref.childState;
    const state = renderer._STATE_;
    state.env = env;
    state.parentNode = parentDomNode;
    renderer.setProps(newVNode.props);
    newVNode.type.patch(renderer);
    if (ref.childRef !== state.ref) {
      return {
        type: REF_PARENT,
        childRef: state.ref,
        childState: renderer,
      };
    } else {
      return ref;
    }
  } else if (newVNode instanceof Node && oldVNode instanceof Node) {
    ref.node = newVNode;
    return ref;
  } else {
    return mount(newVNode, env);
  }
}

/**
 * Execute any compoenent specific unmount code
 */
export function unmount(vnode: VNode, ref: any, env: IEnv) {
  // if (vnode instanceof Node ||  isEmpty(vnode) || isLeaf(vnode)) return;
  if (isElement(vnode)) {
    unmountDirectives(ref.node, vnode.props, env);
    if (vnode.props.children != null)
      unmount(vnode.props.children, ref.children, env);
  } else if (isNonEmptyArray(vnode)) {
    vnode.forEach((childVNode, index) =>
      unmount(childVNode, ref.children[index], env),
    );
  } else if (isRenderFunction(vnode)) {
    unmount(ref.childState, ref.childRef, env);
  } else if (isComponent(vnode)) {
    vnode.type.unmount(ref.childState);
  }
}

export function patchInPlace(
  parentDomNode: Element,
  newVNode: VNode,
  oldVNode: VNode,
  ref: any,
  env: IEnv,
) {
  const newRef = patch(parentDomNode, newVNode, oldVNode, ref, env);
  if (newRef !== ref) {
    replaceDom(parentDomNode, newRef, ref);
    unmount(oldVNode, ref, env);
  }
  return newRef;
}

function patchChildren(
  parentDomNode: Element,
  newChildren: any[],
  oldchildren: any[],
  ref: any,
  env: IEnv,
) {
  // We need to retreive the next sibling before the old children
  // get eventually removed from the current DOM document
  const nextNode = getNextSibling(ref);
  const children = Array(newChildren.length);
  const refChildren = ref.children;
  let newStart = 0;
  let oldStart = 0;
  let newEnd = newChildren.length - 1;
  let oldEnd = oldchildren.length - 1;
  let oldVNode, newVNode, oldRef, newRef, refMap: any;

  while (newStart <= newEnd && oldStart <= oldEnd) {
    if (refChildren[oldStart] === null) {
      oldStart++;
      continue;
    }
    if (refChildren[oldEnd] === null) {
      oldEnd--;
      continue;
    }

    oldVNode = oldchildren[oldStart];
    newVNode = newChildren[newStart];
    if (newVNode?.key === oldVNode?.key) {
      oldRef = refChildren[oldStart];
      newRef = children[newStart] = patchInPlace(
        parentDomNode,
        newVNode,
        oldVNode,
        oldRef,
        env,
      );
      newStart++;
      oldStart++;
      continue;
    }

    oldVNode = oldchildren[oldEnd];
    newVNode = newChildren[newEnd];
    if (newVNode?.key === oldVNode?.key) {
      oldRef = refChildren[oldEnd];
      newRef = children[newEnd] = patchInPlace(
        parentDomNode,
        newVNode,
        oldVNode,
        oldRef,
        env,
      );
      newEnd--;
      oldEnd--;
      continue;
    }

    if (refMap == null) {
      refMap = {};
      for (let i = oldStart; i <= oldEnd; i++) {
        oldVNode = oldchildren[i];
        if (oldVNode?.key != null) {
          refMap[oldVNode.key] = i;
        }
      }
    }

    newVNode = newChildren[newStart];
    const idx = newVNode?.key != null ? refMap[newVNode.key] : null;
    if (idx != null) {
      oldVNode = oldchildren[idx];
      oldRef = refChildren[idx];
      newRef = children[newStart] = patch(
        parentDomNode,
        newVNode,
        oldVNode,
        oldRef,
        env,
      );
      insertDom(parentDomNode, newRef, getDomNode(refChildren[oldStart]));
      if (newRef !== oldRef) {
        removeDom(parentDomNode, oldRef);
        unmount(oldVNode, oldRef, env);
      }
      refChildren[idx] = null;
    } else {
      newRef = children[newStart] = mount(newVNode, env);
      insertDom(parentDomNode, newRef, getDomNode(refChildren[oldStart]));
    }
    newStart++;
  }

  const beforeNode =
    newEnd < newChildren.length - 1
      ? getDomNode(children[newEnd + 1])
      : nextNode;
  while (newStart <= newEnd) {
    const newRef = mount(newChildren[newStart], env);
    children[newStart] = newRef;
    insertDom(parentDomNode, newRef, beforeNode);
    newStart++;
  }
  while (oldStart <= oldEnd) {
    oldRef = refChildren[oldStart];
    if (oldRef != null) {
      removeDom(parentDomNode, oldRef);
      unmount(oldchildren[oldStart], oldRef, env);
    }
    oldStart++;
  }
  ref.children = children;
}

function defaultShouldUpdate(p1: IProps, p2: IProps): boolean {
  if (p1 === p2) return false;
  for (const key in p2) {
    if (p1[key] !== p2[key]) return true;
  }
  return false;
}
