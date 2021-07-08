export type IKey = string | number | any | null;

export const VTYPE_ELEMENT = 0x80;
export const VTYPE_COMPONENT = 0x100;

export type IVType = typeof VTYPE_ELEMENT | typeof VTYPE_COMPONENT;

export type VComponent = {
  readonly vtype: typeof VTYPE_COMPONENT;
  readonly type: IComponentObject<any>;
  readonly key: IKey;
  readonly props: { [key: string]: any };
  _state: any;
  label: string;
  marker?: string;
};

export type VElement = {
  readonly vtype: typeof VTYPE_ELEMENT;
  readonly type: any;
  readonly key: IKey;
  readonly props: { [key: string]: any };
  children: VNode[];
  label: string;
  marker?: string;
};

export type VNode = VComponent | VElement;

export type IDomNode = Node;

export type IEnv = {
  isSvg?: boolean;
};

type IFunctionalComponent<P> = (props: P) => VNode;

// type IClosureComponentSimple__Deprecated<P> = (props: P) => (props: P) => VNode;

// type IClosureComponent__Deprecated<P> = (
//   props: P,
// ) => {
//   render: (props: P) => VNode;
//   didUdate?(): void;
//   didMount?(): void;
//   willUnmount?(): void;
// };

export type IComponentFunction<P> = IFunctionalComponent<P>;
// | IClosureComponentSimple__Deprecated<P>
// | IClosureComponent__Deprecated<P>;

export interface IComponentObject<P> {
  mount(props: P, stateRef: any, env: IEnv | undefined): Node;
  patch(
    newProps: P,
    oldProps: P,
    stateRef: any,
    domNode: Node,
    env: IEnv | undefined,
  ): Node;
  unmount(stateRef: any, domNode: Node, env: IEnv | undefined): void;
}
