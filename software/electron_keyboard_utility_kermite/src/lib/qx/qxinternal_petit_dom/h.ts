import { qxInterposeProps } from '../qxInterposeProps';
import { createFunctionComponent } from './createRenderComponent';
import {
  VNode,
  VTYPE_ELEMENT,
  VTYPE_COMPONENT,
  IComponentFunction,
  VElement,
  VComponent,
  IComponentObject
} from './types';
import { maybeFlattenArray } from './utils';

export const isVNull = (c: VNode | null | false | undefined) =>
  c === null || c === false || c === undefined;
export const isVLeaf = (c: any) =>
  typeof c === 'string' || typeof c === 'number';
export const isVElement = (c: VNode): c is VElement =>
  c?.vtype === VTYPE_ELEMENT;
export const isVComponent = (c: VNode): c is VComponent =>
  c?.vtype === VTYPE_COMPONENT;

const isValidComponentType = (c: any): c is IComponentObject<any> =>
  c?.mount && c.patch && c.unmount;

export function h(
  type: string | IComponentFunction<any>,
  props: any,
  ...children: any[]
): VNode | null {
  const key = props ? props.key : null;

  const skip = props && 'qxIf' in props && !props.qxIf;
  if (skip) {
    return null;
  }

  qxInterposeProps(props, type);

  if (typeof type === 'string') {
    return {
      vtype: VTYPE_ELEMENT,
      type,
      key,
      props,
      children: maybeFlattenArray(children)
    };
  } else if (isValidComponentType(type)) {
    return {
      vtype: VTYPE_COMPONENT,
      type,
      key,
      props: Object.assign({}, props, { children }),
      _state: null
    };
  } else if (typeof type === 'function') {
    return {
      vtype: VTYPE_COMPONENT,
      type: createFunctionComponent(type),
      key,
      props: Object.assign({}, props, { children }),
      _state: null
    };
  }
  throw new Error('h: Invalid type!');
}
