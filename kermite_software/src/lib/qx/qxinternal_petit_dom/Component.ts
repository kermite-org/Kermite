import { qxGlobal } from '../qxGlobal';
import { VNode, IEnv } from './types';
import { mount, patch, unmount } from './index';

const promise = Promise.resolve();
function doLater(fn: () => void) {
  promise.then(fn);
}

interface IStateRef {
  instance: Component<any, any>;
  env: IEnv;
  node: Node;
  vnode: VNode;
}

export class Component<P, S> {
  props!: P;
  state!: S;

  constructor(props: P) {
    if (props) {
      this.props = props;
    }
  }

  componentDidMount() {}
  componentDidUpdate() {}
  componentWillUnmount() {}

  render(): JSX.Element {
    return null!;
  }

  forceUpdate() {
    qxGlobal.rerender();
  }

  setState(arg: Partial<S> | ((prevState: S, props: P) => S)) {
    if (typeof arg === 'function') {
      this.state = arg(this.state, this.props);
    } else {
      this.state = { ...this.state, arg };
    }
    qxGlobal.rerender();
  }

  static mount(props: any, stateRef: IStateRef, env: IEnv) {
    const instance = new this(props);
    stateRef.instance = instance;
    stateRef.env = env;
    stateRef.vnode = instance.render() as VNode;
    stateRef.node = mount(stateRef.vnode, env);
    if (instance.componentDidMount) {
      doLater(() => instance.componentDidMount());
    }
    return stateRef.node;
  }

  static patch(
    newProps: any,
    oldProps: any,
    stateRef: IStateRef,
    domNode: Node,
    env: IEnv
  ) {
    const instance = stateRef.instance;
    instance.props = newProps;
    stateRef.env = env;

    const newVNode = instance.render() as VNode;
    const oldVNode = stateRef.vnode;
    stateRef.vnode = newVNode;
    stateRef.node = patch(newVNode, oldVNode, stateRef.node, stateRef.env);

    if (instance.componentDidUpdate) {
      doLater(() => instance.componentDidUpdate()); // oldProps, instance.state));
    }
    return stateRef.node;
  }

  static unmount(stateRef: IStateRef, domNode: Node, env: IEnv) {
    delete stateRef.instance.setState;
    delete stateRef.instance.forceUpdate;
    if (stateRef.instance.componentWillUnmount) {
      stateRef.instance.componentWillUnmount();
    }
    unmount(stateRef.vnode, domNode, env);
  }
}
