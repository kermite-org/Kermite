import { createFunctionComponent } from '../createRenderComponent';
import { qxInterposeProps } from '../qxInterposeProps';
import { isValidComponentType } from './checker';
import {
  IComponentFunction,
  VNode,
  VTYPE_COMPONENT,
  VTYPE_ELEMENT,
} from './types';
import { maybeFlattenArray } from './utils';

export function jsx(
  type: string | IComponentFunction<any>,
  props: any,
  ...argsChildren: any[]
): VNode | null {
  const key = props ? props.key : null;

  const skip = props && 'qxIf' in props && !props.qxIf;
  if (skip) {
    return null;
  }

  const children = props?.children || argsChildren;

  qxInterposeProps(props, type);

  if (typeof type === 'string') {
    return {
      label: type,
      vtype: VTYPE_ELEMENT,
      type,
      key,
      props: { ...props, children: undefined },
      children: maybeFlattenArray(children),
    };
  } else if (isValidComponentType(type)) {
    return {
      label: 'componentObject',
      vtype: VTYPE_COMPONENT,
      type,
      key,
      props: Object.assign({}, props, { children }),
      _state: null,
    };
  } else if (typeof type === 'function') {
    return {
      label: type.name,
      vtype: VTYPE_COMPONENT,
      type: createFunctionComponent(type),
      key,
      props: Object.assign({}, props, { children }),
      _state: null,
    };
  }
  throw new Error('h: Invalid type!');
}
