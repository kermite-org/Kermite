import { mount, patch, unmount } from './vdom';
import { IEnv, VNode, IComponentFunction, IComponentObject } from './types';

const promise = Promise.resolve();
function doLater(fn: () => void) {
  promise.then(fn);
}

interface IComponentStateRef {
  instance: any;
  env: IEnv;
  node: Node;
  vnode: VNode;
  renderFn: (props: any) => VNode;
  closureObject?: {
    didMount?(): void;
    didUpdate?(): void;
    willUnmount?(): void;
  };
  // durablePropObject: any;
  wasUnmounted: boolean;
}

function createRenderComponent<P extends {}>({
  componentFn,
  shouldUpdate = shallowCompare
}: {
  componentFn: IComponentFunction<P>;
  shouldUpdate?: (p1: P, p2: P, c1?: any, c2?: any) => boolean;
}): IComponentObject<P> {
  return {
    mount(props: P, stateRef: IComponentStateRef, env: IEnv) {
      const res = componentFn(props);
      if (
        res &&
        typeof res === 'object' &&
        'render' in res &&
        typeof res.render === 'function'
      ) {
        //full closure component
        // console.log(`initialize full closure component ${componentFn.name}`);
        const renderFn = res.render;
        const vnode = renderFn(props);
        const node = mount(vnode, env);
        stateRef.renderFn = renderFn;
        stateRef.vnode = vnode;
        stateRef.node = node;
        stateRef.closureObject = res;
        if (stateRef.closureObject.didMount) {
          doLater(stateRef.closureObject.didMount);
        }
        return node;
      } else if (typeof res === 'function') {
        //simple closure component
        // console.log(`initialize simple closure component ${componentFn.name}`);
        const renderFn = res;
        // const durablePropObject = { ...props };
        const vnode = renderFn(props);
        const node = mount(vnode, env);
        // console.log({ durablePropObject });
        // stateRef.durablePropObject = durablePropObject;
        stateRef.renderFn = renderFn;
        stateRef.vnode = vnode;
        stateRef.node = node;
        return node;
      } else if ((res && 'vtype' in res) || !res) {
        //function component
        // console.log(`initialize function component ${componentFn.name}`);
        const vnode = res;
        stateRef.vnode = vnode;
        stateRef.renderFn = componentFn as any;
        return mount(vnode, env);
      }
      throw new Error('invalid component function');
    },
    patch(
      newProps: P,
      oldProps: P,
      stateRef: IComponentStateRef,
      domNode: Node,
      env: IEnv
    ) {
      if (!shouldUpdate(newProps, oldProps)) {
        return domNode;
      }
      const { renderFn } = stateRef;

      // if (stateRef.durablePropObject) {
      //   bumpObjectFields(stateRef.durablePropObject, newProps);
      // }
      const newVNode = renderFn(newProps);
      const oldVNode = stateRef.vnode;
      stateRef.vnode = newVNode;
      if (stateRef.closureObject?.didUpdate) {
        doLater(stateRef.closureObject.didUpdate);
      }
      return patch(newVNode, oldVNode, domNode, env);
    },
    unmount(stateRef: IComponentStateRef, domNode: Node, env: IEnv) {
      stateRef.wasUnmounted = true;
      if (stateRef.closureObject?.willUnmount) {
        stateRef.closureObject.willUnmount();
      }
      unmount(stateRef.vnode, domNode, env);
    }
  };
}

function shallowCompare<P>(p1: P, p2: P, c1?: string, c2?: string) {
  if (c1 !== c2) return true;

  for (const key in p1) {
    if (p1[key] !== p2[key]) return true;
  }
  return false;
}

const PD_COMPONENT = Symbol('@petit-dom/component');

type IRenderFunction<P> = IComponentFunction<P> & {
  shouldUpdate?: (a: P, b: P, c1?: any, c2?: any) => boolean;
  [PD_COMPONENT]?: IComponentObject<P>;
};

export function createFunctionComponent<P>(renderFunction: IRenderFunction<P>) {
  let component = renderFunction[PD_COMPONENT];
  if (!component) {
    component = renderFunction[PD_COMPONENT] = createRenderComponent({
      componentFn: renderFunction,
      shouldUpdate: renderFunction.shouldUpdate
    });
  }
  return component;
}
