import { getFunctionComponentWrapperCached } from './functionComponentWrapper';
import { h as petit_dom_h } from './petit_dom_060';
import { IProps, VNode } from './petit_dom_060/types';
import { qxInterposeProps } from './qxInterposeProps';

export function jsx(
  type: string | Function,
  props: IProps,
  ...children: VNode[]
): VNode {
  const skip = props && 'qxIf' in props && !props.qxIf;
  if (skip) {
    return null;
  }
  qxInterposeProps(props, type);

  if (typeof type === 'function') {
    type = getFunctionComponentWrapperCached(type);
  }

  return petit_dom_h(type, props, ...children);
}
