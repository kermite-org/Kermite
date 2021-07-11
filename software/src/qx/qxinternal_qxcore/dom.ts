import { IVElement } from 'qx/qxinternal_qxcore/types';

export function applyDomAttributes(
  el: Element,
  vnode: IVElement,
  oldVnode: IVElement | undefined,
) {
  if (vnode.marker) {
    el.setAttribute('data-fc', vnode.marker);
  }

  for (const key in vnode.props) {
    if (
      key === 'key' ||
      key === 'children' ||
      key === 'qxIf' ||
      key === 'ref'
    ) {
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
}
