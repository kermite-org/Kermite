import { IHookInstance } from 'qx/hookImpl';

export type IElementProps = {
  id?: string;
  className?: string;
  [key: string]: any;
};

export type IVBlank = {
  vtype: 'vBlank';
  debugSig: string;
  dom?: Comment;
};

export type IVText = {
  vtype: 'vText';
  text: string;
  debugSig: string;
  dom?: Text;
};

export type IVElement = {
  vtype: 'vElement';
  tagName: string;
  props: IElementProps;
  children: IVNode[];
  debugSig: string;
  marker?: string;
  dom?: Element;
};

export type IVFragment = {
  vtype: 'vFragment';
  children: IVNode[];
  dom?: Element;
};

export type IProps = {
  [key: string]: any;
};

export type IComponentState = {
  fcsig: string;
  hook: IHookInstance;
  renderWithHook: (props: IProps) => IVNode;
};

export type IVComponentWrapper = {
  name: string;
  mount: (self: IComponentState, props: IProps) => IVNode | null;
  update: (self: IComponentState, props: IProps) => IVNode | null;
  unmount: (self: IComponentState) => void;
};

export type IVComponent = {
  vtype: 'vComponent';
  componentWrapper: IVComponentWrapper;
  // renderFunc: IRenderFunc;
  props: IProps;
  children: IVNode[];
  debugSig: string;
  state: {
    componentState?: IComponentState;
    renderRes?: IVNode;
  };
  dom?: Node; // 関数コンポーネントのVNodeと関数コンポーネントのレンダリング結果のルート要素のVNodeが同じdom要素を参照する
  parentDom?: Node;
};

export type IVNode = IVBlank | IVText | IVElement | IVComponent | IVFragment;
