import {
  IProps,
  VNode,
  VTYPE_COMPONENT,
  VTYPE_ELEMENT,
  VTYPE_FUNCTION,
  VElement,
  VFunction,
  VComponent,
} from './types';

export const EMPTY_OBJECT = {};

export const isEmpty = (c: VNode) =>
  c === null || (Array.isArray(c) && c.length === 0);

export const isNonEmptyArray = (c: VNode): c is VNode[] =>
  Array.isArray(c) && c.length > 0;

export const isLeaf = (c: VNode): c is string =>
  typeof c === 'string' || typeof c === 'number';

export const isElement = (c: VNode): c is VElement =>
  (c as any)?.vtype === VTYPE_ELEMENT;

export const isRenderFunction = (c: VNode): c is VFunction =>
  (c as any)?.vtype === VTYPE_FUNCTION;

export const isComponent = (c: VNode): c is VComponent =>
  (c as any)?.vtype === VTYPE_COMPONENT;

const isValidComponentType = (c: any) => typeof c?.mount === 'function';

export function jsx(
  type: string | Function,
  props: IProps,
  key: string,
): VNode {
  if (typeof type === 'string') {
    return {
      vtype: VTYPE_ELEMENT,
      type,
      key,
      props,
    };
  } else if (typeof type === 'function') {
    return {
      vtype: VTYPE_FUNCTION,
      type,
      key,
      props,
    };
  } else if (isValidComponentType(type)) {
    return {
      vtype: VTYPE_COMPONENT,
      type,
      key,
      props,
    };
  } else {
    throw new Error('Invalid VNode type');
  }
}

export const jsxs = jsx;

export function Fragment(props: IProps): VNode[] {
  return props.children;
}
