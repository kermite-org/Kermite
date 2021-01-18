import { deepEqual } from 'fast-equals';
import {
  createHookInstance,
  IHook,
  switchGlobalHookInstance
} from './hookImpl';
import { QxOptimizerSpec } from '../qx';
import { qxGlobal } from '../qxGlobal';
import { deepEqualValuesBesidesFunction } from '../qxUtils';
import { IEnv, VNode, IComponentFunction, IComponentObject } from './types';
import { mount, patch, unmount } from './vdom';

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
  hook?: IHook;
}

function createRenderComponent<P extends {}>({
  componentFn
}: // shouldUpdate = shallowCompare
{
  componentFn: IComponentFunction<P>;
  // shouldUpdate?: (p1: P, p2: P) => boolean;
}): IComponentObject<P> {
  return {
    mount(props: P, stateRef: IComponentStateRef, env: IEnv) {
      const hook = createHookInstance();
      switchGlobalHookInstance(hook);
      const res = componentFn(props);
      if (
        res &&
        typeof res === 'object' &&
        'render' in res &&
        typeof res.render === 'function'
      ) {
        // full closure component
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
        // simple closure component
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
        // function component
        // console.log(`initialize function component ${componentFn.name}`);
        if (0) {
          //no hooks integration
          const vnode = res;
          stateRef.vnode = vnode;
          stateRef.renderFn = componentFn as any;
          return mount(vnode, env);
        } else {
          //with hooks integration
          const vnode = res;
          stateRef.vnode = vnode;
          stateRef.hook = hook;
          stateRef.renderFn = ((props: any) => {
            switchGlobalHookInstance(stateRef.hook!);
            return componentFn(props);
          }) as any;
          return mount(vnode, env);
        }
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
      const keep = shouldRetainCurrentDomNode(
        oldProps,
        newProps,
        componentFn.name
      );
      qxGlobal.debug.nAll++;

      if (keep) {
        // console.log(`skip`, componentFn.name);
        return domNode;
      } else {
        // console.log(componentFn.name || componentFn.toString());
        qxGlobal.debug.nUpdated++;
        // if (stateRef.durablePropObject) {
        //   bumpObjectFields(stateRef.durablePropObject, newProps);
        // }
        const newVNode = stateRef.renderFn(newProps);
        const oldVNode = stateRef.vnode;
        stateRef.vnode = newVNode;
        if (stateRef.closureObject?.didUpdate) {
          doLater(stateRef.closureObject.didUpdate);
        }
        return patch(newVNode, oldVNode, domNode, env);
      }
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

function shouldRetainCurrentDomNode<
  P extends { qxOptimizer?: QxOptimizerSpec; [key: string]: any }
>(props0: P, props1: P, _funcName: string) {
  if (props1.qxOptimizer === 'shallowEqual') {
    for (const key in props1) {
      if (props1[key] !== props0[key]) {
        return true;
      }
    }
    return false;
  }

  if (props1.qxOptimizer === 'deepEqual') {
    const res = deepEqual(props0, props1);
    // console.log('deepEqual', funcName, res);
    return res;
  }

  if (props1.qxOptimizer === 'deepEqualExFn') {
    const res = deepEqualValuesBesidesFunction(props0, props1);
    // console.log('deepEqualExFn', funcName, res);
    return res;
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
      componentFn: renderFunction
    });
  }
  return component;
}
