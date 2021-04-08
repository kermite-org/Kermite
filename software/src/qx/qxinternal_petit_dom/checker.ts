import {
  IComponentObject,
  VComponent,
  VElement,
  VNode,
  VTYPE_COMPONENT,
  VTYPE_ELEMENT,
} from 'qx/qxinternal_petit_dom/types';

export const isVNull = (c: VNode | null | false | undefined) =>
  c === null || c === false || c === undefined;
export const isVLeaf = (c: any) =>
  typeof c === 'string' || typeof c === 'number';
export const isVElement = (c: VNode): c is VElement =>
  c?.vtype === VTYPE_ELEMENT;
export const isVComponent = (c: VNode): c is VComponent =>
  c?.vtype === VTYPE_COMPONENT;

export const isValidComponentType = (c: any): c is IComponentObject<any> =>
  c?.mount && c.patch && c.unmount;
