export const VTYPE_ELEMENT = 1;
export const VTYPE_FUNCTION = 2;
export const VTYPE_COMPONENT = 4;

export type IProps = { [key: string]: any };

export type VElement = {
  vtype: typeof VTYPE_ELEMENT;
  type: string;
  key?: string;
  props: IProps;
};

export type VFunction = {
  vtype: typeof VTYPE_FUNCTION;
  type: Function & { shouldUpdate?: any };
  key?: string;
  props: IProps;
};

export type VComponent = {
  vtype: typeof VTYPE_COMPONENT;
  type: { mount: any; patch: any; unmount: any };
  key?: string;
  props: IProps;
};
export type VNodeCore = VElement | VFunction | VComponent;

export type VNode = VNodeCore | VNode[] | string | number | null;

export const REF_SINGLE = 1; // ref with a single dom node
export const REF_ARRAY = 4; // ref with an array od nodes
export const REF_PARENT = 8; // ref with a child ref

export type IRendererState = {
  env: IEnv;
  vnode: VNode;
  parentDomNode: Element | null;
  ref: IRef;
};

export type IRenderer = {
  oldProps?: IProps;
  props: IProps;
  _STATE_: IRendererState;
  setProps(props: IProps): void;
  render(vnode: VNode): void;
};

type IRefSingle = {
  type: typeof REF_SINGLE;
  node: Node;
  children?: IRef;
};

type IRefArray = {
  type: typeof REF_ARRAY;
  children: IRef[];
};

type IRefParent = {
  type: typeof REF_PARENT;
  childRef: IRef;
  childState: IRenderer;
};

export type IRef = IRefSingle | IRefArray | IRefParent;

export type IDirective = {
  mount(element: any, value: any): void;
  patch(element: any, newValue: any, oldValue: any): void;
  unmount(element: any, _: any): void;
};

export type IEnv = {
  isSvg: boolean;
  directives: { [key: string]: IDirective };
};
