import { attributeIgnoreKeys } from 'qx/qxinternal_qxcore/constants';
import { IVElement } from 'qx/qxinternal_qxcore/types';

export function applyDomAttributes(
  el: Element,
  vnode: IVElement,
  oldVNode: IVElement | undefined,
) {
  const oldProps = oldVNode?.props || {};
  const newProps = vnode.props;

  const changed = Object.keys(newProps)
    .filter((key) => !attributeIgnoreKeys.includes(key))
    .filter((key) => newProps[key] !== oldProps[key]);

  const removed = Object.keys(oldProps)
    .filter((key) => !attributeIgnoreKeys.includes(key))
    .filter((key) => newProps[key] === undefined);

  removed.forEach((key) => {
    const value = oldProps[key];
    if (key.startsWith('on') && typeof value === 'function') {
      (el as any)[key.toLocaleLowerCase()] = undefined;
    } else {
      el.removeAttribute(key);
    }
  });

  changed.forEach((key) => {
    const value = vnode.props[key];
    if (value === false || value === null || value === undefined) {
      el.removeAttribute(key);
    } else if (key.startsWith('on') && typeof value === 'function') {
      (el as any)[key.toLocaleLowerCase()] = value;
    } else {
      el.setAttribute(key, value?.toString() || '');
    }
  });

  if (!oldVNode?.marker && vnode.marker) {
    el.setAttribute('data-fc', vnode.marker);
  }
}
