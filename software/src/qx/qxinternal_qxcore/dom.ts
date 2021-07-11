import { IVElement } from 'qx/qxinternal_qxcore/types';

export function applyDomAttributes(
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
