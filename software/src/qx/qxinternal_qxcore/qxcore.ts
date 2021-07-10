import { qxInterposeProps } from '../qxInterposeProps';
// eslint-disable-next-line import/no-cycle
import { getFunctionComponentWrapperCached } from './functionComponentWrapper';

type IElementProps = {
  id?: string;
  className?: string;
  [key: string]: any;
};

type IVBlank = {
  vtype: 'vBlank';
  debugSig: string;
  dom?: Comment;
};

type IVText = {
  vtype: 'vText';
  text: string;
  debugSig: string;
  dom?: Text;
};

type IVElement = {
  vtype: 'vElement';
  tagName: string;
  props: IElementProps;
  children: IVNode[];
  debugSig: string;
  marker?: string;
  dom?: Element;
};

type IProps = {
  [key: string]: any;
};

export type IVComponentWrapper = {
  name: string;
  mount: (self: any, props: IProps) => IVNode | null;
  update: (self: any, props: IProps) => IVNode | null;
  unmount: (self: any) => void;
};

type IVComponent = {
  vtype: 'vComponent';
  componentWrapper: IVComponentWrapper;
  // renderFunc: IRenderFunc;
  props: IProps;
  children: IVNode[];
  debugSig: string;
  state: {
    componentState?: any;
    renderRes?: IVNode;
  };
  dom?: Node; // 関数コンポーネントのVNodeと関数コンポーネントのレンダリング結果のルート要素のVNodeが同じdom要素を参照する
};

export type IVNode = IVBlank | IVText | IVElement | IVComponent;

function createVBlank(value: null | undefined | false): IVBlank {
  return { vtype: 'vBlank', debugSig: `blank__${value}` };
}

function createVText(text: string): IVText {
  return { vtype: 'vText', text, debugSig: `text__${text}` };
}

function createVElement(
  tagName: string,
  props: IProps,
  children: IVNode[],
): IVElement {
  return {
    vtype: 'vElement',
    tagName,
    props,
    children,
    debugSig: `${tagName}__${children.length}`,
  };
}

function createVComponent(
  componentWrapper: IVComponentWrapper,
  props: IProps,
  children: IVNode[],
): IVComponent {
  return {
    vtype: 'vComponent',
    componentWrapper,
    props,
    children,
    debugSig: `${componentWrapper.name}__${children.length}`,
    state: {},
  };
}

type ISourceChild = IVNode | string | number | boolean | undefined;

function convertChildren(children: ISourceChild[]): IVNode[] {
  if (children.length === 1 && Array.isArray(children[0])) {
    children = children[0];
  }

  return children.map((child) => {
    if (child === null || child === undefined || child === false) {
      return createVBlank(child);
    } else if (
      typeof child === 'string' ||
      typeof child === 'number' ||
      typeof child === 'boolean'
    ) {
      return createVText(child.toString());
    } else {
      return child;
    }
  });
}

export function jsx(
  tagType: string | IVComponentWrapper,
  props: IProps | undefined,
  ...children: (string | IVNode)[]
): IVNode | null {
  props ||= {};

  const skip = props && 'qxIf' in props && !props.qxIf;
  if (skip) {
    return null;
  }

  qxInterposeProps(props, tagType);

  if (typeof tagType === 'function') {
    tagType = getFunctionComponentWrapperCached(tagType);
  }

  const vnode =
    typeof tagType === 'object'
      ? createVComponent(tagType, props, convertChildren(children))
      : createVElement(tagType, props, convertChildren(children));
  return vnode;
}

// ------------------------------------------------------------

function removeDomChildren(parentDom: Node) {
  while (parentDom.firstChild) {
    parentDom.removeChild(parentDom.firstChild);
  }
}

function applyDomAttributes(
  el: Element,
  vnode: IVElement,
  oldVnode: IVElement | undefined,
) {
  // const newClassNames = vnode.props.className?.split(' ');
  // const oldClassNames = oldVnode?.props.className?.split(' ');
  // const added = newClassNames?.filter((it) => !oldClassNames?.includes(it));
  // const removed = oldClassNames?.filter((it) => !newClassNames?.includes(it));
  // if (added) {
  //   added.forEach((it) => el.classList.add(it));
  // }
  // if (removed) {
  //   removed.forEach((it) => el.classList.remove(it));
  // }

  for (const key in vnode.props) {
    if (key === 'key' || key === 'children' || key === 'qxIf') {
      continue;
    }
    const value = vnode.props[key];

    if (value === false || value === null || value === undefined) {
      el.removeAttribute(key);
    } else if (key.startsWith('on') && typeof value === 'function') {
      (el as any)[key.toLocaleLowerCase()] = value;
    } else {
      el.setAttribute(key, value?.toString() || '');
    }
  }

  if (vnode.marker) {
    el.setAttribute('data-fc', vnode.marker);
  }
}

// function cleanupDomAttributes(el: Element, vnode: IVElement) {
//   for (const key in vnode.props) {
//     const value = vnode.props[key];
//     if (key.startsWith('on') && typeof value === 'function') {
//       // (el as any)[key.toLocaleLowerCase()] = undefined;
//     }
//   }
// }

// ------------------------------------------------------------

function realize(vnode: IVNode): Node {
  if (vnode.vtype === 'vText') {
    const dom = document.createTextNode(vnode.text);
    vnode.dom = dom;
    return dom;
  } else if (vnode.vtype === 'vElement') {
    const dom = document.createElement(vnode.tagName);
    applyDomAttributes(dom, vnode, undefined);
    const childDomNodes = vnode.children.map(realize);
    childDomNodes.forEach((it) => dom.appendChild(it));
    vnode.dom = dom;
    return dom;
  } else if (vnode.vtype === 'vComponent') {
    const dom = mountFc(vnode);
    vnode.dom = dom;
    return dom;
  } else {
    const dom = document.createComment('NULL');
    vnode.dom = dom;
    return dom;
  }
}

// ------------------------------------------------------------

function makePropsWithChildren(props: IProps, children: IVNode[]) {
  if (children.length === 1) {
    return { ...props, children: children[0] };
  } else {
    return { ...props, children };
  }
}

function mountFc(vnode: IVComponent): Node {
  vnode.state.componentState = {};
  const props = makePropsWithChildren(vnode.props, vnode.children);
  const draftRes =
    vnode.componentWrapper.mount(vnode.state.componentState, props) ||
    createVBlank(null);
  vnode.state.renderRes = draftRes;
  // console.log('mountFc', vnode.debugSig, draftRes);
  return realize(draftRes);
}

function patchFc(dom: Node, newVNode: IVComponent, oldVNode: IVComponent) {
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
  patch(dom, draftRes, prevRenderRes);
}

function unmountFc(vnode: IVComponent) {
  vnode.componentWrapper.unmount(vnode.state.componentState);
}

// ------------------------------------------------------------

function mount(parentDom: Node, vnode: IVNode): Node {
  const el = realize(vnode);
  parentDom.appendChild(el);
  return el;
}

function mountChildren(parentDom: Node, vnodes: IVNode[]) {
  const nodes = vnodes.map(realize);
  nodes.forEach((node) => parentDom.appendChild(node));
}

function unmount(dom: Node, oldVNode: IVNode) {
  if (oldVNode.vtype === 'vComponent') {
    unmountFc(oldVNode);
  }
  if (oldVNode.vtype === 'vElement' && dom instanceof Element) {
    // cleanupDomAttributes(dom, oldVNode);
  }
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

  if (newVNodes.length === oldVNodes.length) {
    for (let i = 0; i < newVNodes.length; i++) {
      // const dom = childDomNodes[i];
      const newVNode = newVNodes[i];
      const oldVNode = oldVNodes[i];
      const dom = oldVNode.dom!;
      patch(dom, newVNode, oldVNode);
      newVNode.dom = dom;
    }
  } else {
    for (let i = 0; i < oldVNodes.length; i++) {
      // const dom = childDomNodes[i];
      const oldVNode = oldVNodes[i];
      unmount(oldVNode.dom!, oldVNode);
    }
    removeDomChildren(parentDom);
    mountChildren(parentDom, newVNodes);
  }
}

function patch(dom: Node, newVNode: IVNode, oldVNode: IVNode) {
  if (newVNode === oldVNode) {
  } else if (newVNode.vtype === 'vBlank' && oldVNode.vtype === 'vBlank') {
  } else if (newVNode.vtype === 'vText' && oldVNode.vtype === 'vText') {
    if (newVNode.text !== oldVNode.text) {
      dom.nodeValue = newVNode.text;
    } else {
    }
  } else if (
    newVNode.vtype === 'vComponent' &&
    oldVNode.vtype === 'vComponent' &&
    newVNode.componentWrapper === oldVNode.componentWrapper
  ) {
    patchFc(dom, newVNode, oldVNode);
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
      unmount(dom, oldVNode);
    }
    const parentDom = dom.parentElement;
    if (parentDom) {
      parentDom.removeChild(dom);
      mount(parentDom, newVNode);
    }
  }
}

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
