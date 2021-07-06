import {
  IDirective,
  IEnv,
  IProps,
  IRef,
  REF_ARRAY,
  REF_PARENT,
  REF_SINGLE,
} from './types';

export const SVG_NS = 'http://www.w3.org/2000/svg';

function propDirective(prop: string): IDirective {
  return {
    mount(element, value) {
      element[prop] = value;
    },
    patch(element, newValue, oldValue) {
      if (newValue !== oldValue) {
        element[prop] = newValue;
      }
    },
    unmount(element, _) {
      element[prop] = null;
    },
  };
}

export const DOM_PROPS_DIRECTIVES: Record<string, IDirective> = {
  selected: propDirective('selected'),
  checked: propDirective('checked'),
  value: propDirective('value'),
  innerHTML: propDirective('innerHTML'),
};
/**
  TODO: activate full namespaced attributes (not supported in JSX)
  const XML_NS = "http://www.w3.org/XML/1998/namespace"
**/
const XLINK_NS = 'http://www.w3.org/1999/xlink';
const NS_ATTRS = {
  show: XLINK_NS,
  actuate: XLINK_NS,
  href: XLINK_NS,
};

export function getDomNode(ref: IRef): Node {
  if (ref.type === REF_SINGLE) {
    return ref.node;
  } else if (ref.type === REF_ARRAY) {
    return getDomNode(ref.children[0]);
  } else if (ref.type === REF_PARENT) {
    return getDomNode(ref.childRef);
  }
  throw new Error('Unkown ref type ' + JSON.stringify(ref));
}

export function getParentNode(ref: IRef): Node {
  if (ref.type === REF_SINGLE) {
    return ref.node.parentNode!;
  } else if (ref.type === REF_ARRAY) {
    return getParentNode(ref.children[0]);
  } else if (ref.type === REF_PARENT) {
    return getParentNode(ref.childRef);
  }
  throw new Error('Unkown ref type ' + ref);
}

export function getNextSibling(ref: IRef): Node {
  if (ref.type === REF_SINGLE) {
    return ref.node.nextSibling!;
  } else if (ref.type === REF_ARRAY) {
    return getNextSibling(ref.children[ref.children.length - 1]);
  } else if (ref.type === REF_PARENT) {
    return getNextSibling(ref.childRef);
  }
  throw new Error('Unkown ref type ' + JSON.stringify(ref));
}

export function insertDom(
  parent: Element,
  ref: IRef,
  nextSibling: Node | null,
) {
  if (ref.type === REF_SINGLE) {
    parent.insertBefore(ref.node, nextSibling!);
  } else if (ref.type === REF_ARRAY) {
    ref.children.forEach((ch) => {
      insertDom(parent, ch, nextSibling);
    });
  } else if (ref.type === REF_PARENT) {
    insertDom(parent, ref.childRef, nextSibling);
  } else {
    throw new Error('Unkown ref type ' + JSON.stringify(ref));
  }
}

export function removeDom(parent: Element, ref: IRef) {
  if (ref.type === REF_SINGLE) {
    parent.removeChild(ref.node);
  } else if (ref.type === REF_ARRAY) {
    ref.children.forEach((ch) => {
      removeDom(parent, ch);
    });
  } else if (ref.type === REF_PARENT) {
    removeDom(parent, ref.childRef);
  } else {
    throw new Error('Unkown ref type ' + ref);
  }
}

export function replaceDom(parent: Element, newRef: IRef, oldRef: IRef) {
  insertDom(parent, newRef, getDomNode(oldRef));
  removeDom(parent, oldRef);
}

export function mountDirectives(domElement: Element, props: IProps, env: IEnv) {
  for (const key in props) {
    if (key in env.directives) {
      env.directives[key].mount(domElement, props[key]);
    }
  }
}

export function patchDirectives(
  domElement: Element,
  newProps: IProps,
  oldProps: IProps,
  env: IEnv,
) {
  for (const key in newProps) {
    if (key in env.directives) {
      env.directives[key].patch(domElement, newProps[key], oldProps[key]);
    }
  }
  for (const key in oldProps) {
    if (key in env.directives && !(key in newProps)) {
      env.directives[key].unmount(domElement, oldProps[key]);
    }
  }
}

export function unmountDirectives(
  domElement: Element,
  props: IProps,
  env: IEnv,
) {
  for (const key in props) {
    if (key in env.directives) {
      env.directives[key].unmount(domElement, props[key]);
    }
  }
}

export function mountAttributes(domElement: Element, props: IProps, env: IEnv) {
  for (const key in props) {
    if (key === 'key' || key === 'children' || key in env.directives) continue;
    if (key.startsWith('on')) {
      (domElement as any)[key.toLowerCase()] = props[key];
    } else {
      setDOMAttribute(domElement, key, props[key], env.isSvg);
    }
  }
}

export function patchAttributes(
  domElement: Element,
  newProps: IProps,
  oldProps: IProps,
  env: IEnv,
) {
  for (const key in newProps) {
    if (key === 'key' || key === 'children' || key in env.directives) continue;
    const oldValue = oldProps[key];
    const newValue = newProps[key];
    if (oldValue !== newValue) {
      if (key.startsWith('on')) {
        (domElement as any)[key.toLowerCase()] = newValue;
      } else {
        setDOMAttribute(domElement, key, newValue, env.isSvg);
      }
    }
  }
  for (const key in oldProps) {
    if (
      key === 'key' ||
      key === 'children' ||
      key in env.directives ||
      key in newProps
    )
      continue;
    if (key.startsWith('on')) {
      (domElement as any)[key.toLowerCase()] = null;
    } else {
      domElement.removeAttribute(key);
    }
  }
}

function setDOMAttribute(
  el: Element,
  attr: string,
  value: string | boolean,
  isSvg: boolean,
) {
  if (value === true) {
    el.setAttribute(attr, '');
  } else if (value === false) {
    el.removeAttribute(attr);
  } else {
    const namespace = isSvg ? (NS_ATTRS as any)[attr] : undefined;
    if (namespace !== undefined) {
      el.setAttributeNS(namespace, attr, value);
    } else {
      el.setAttribute(attr, value);
    }
  }
}
