import {
  IProps,
  IVBlank,
  IVComponent,
  IVComponentWrapper,
  IVElement,
  IVNode,
  IVText,
} from 'qx/qxinternal_qxcore/types';
import { qxInterposeProps } from '../qxInterposeProps';
// eslint-disable-next-line import/no-cycle
import { getFunctionComponentWrapperCached } from './functionComponentWrapper';

export function createVBlank(value: null | undefined | false): IVBlank {
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
