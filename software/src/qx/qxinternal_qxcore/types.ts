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

export type IProps = {
  [key: string]: any;
};

export type IVComponentWrapper = {
  name: string;
  mount: (self: any, props: IProps) => IVNode | null;
  update: (self: any, props: IProps) => IVNode | null;
  unmount: (self: any) => void;
};

export type IVComponent = {
  vtype: 'vComponent';
  componentWrapper: IVComponentWrapper;
  // renderFunc: IRenderFunc;
  props: IProps;
  children: IVNode[];
  debugSig: string;
  state: {
    componentState?: any;
    renderRes?: IVNode;
  };
  dom?: Node; // 関数コンポーネントのVNodeと関数コンポーネントのレンダリング結果のルート要素のVNodeが同じdom要素を参照する
  parentDom?: Node;
};

export type IVNode = IVBlank | IVText | IVElement | IVComponent;
