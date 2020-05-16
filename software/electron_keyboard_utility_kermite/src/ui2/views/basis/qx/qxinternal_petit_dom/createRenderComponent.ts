import { mount, patch, unmount } from './vdom';
import { IEnv, VNode, IComponentFunction, IComponentObject } from './types';
import { qxGlobal } from '../qxGlobal';
import { compareObjectByJsonStringify } from '~funcs/Utils';

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
  componentFn
}: //shouldUpdate = shallowCompare
{
  componentFn: IComponentFunction<P>;
  // shouldUpdate?: (p1: P, p2: P) => boolean;
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
      if (componentFn.name === 'HelloCard') {
        // console.log(`props updation: `, oldProps, newProps);
      }
      // shouldUpdate = deadlyDeepCompare;

      // console.log('COMP', componentFn.name, { oldProps, newProps });
      const keep = shouldKeep(oldProps, newProps, componentFn.name);

      // console.log('COMP RES req update', reqUpdate);
      // const reqUpdate = false;
      if (!keep) {
        qxGlobal.debug.nUpdated++;
      }
      qxGlobal.debug.nAll++;

      // console.log(componentFn.name);

      if (keep) {
        // console.log(`skip`, componentFn.name);
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

function chkEqExcFn(a: any, b: any): boolean {
  if (typeof a !== typeof b) {
    return false;
  }
  if (typeof a === 'object') {
    for (const key in a) {
      if (!chkEqExcFn(a[key], b[key])) {
        return false;
      }
    }
    return true;
  } else if (Array.isArray(a) && Array.isArray(b)) {
    for (let i = 0; i < a.length; i++) {
      if (!chkEqExcFn(a[i], b[i])) {
        return false;
      }
    }
    return true;
  } else if (typeof a === 'function') {
    return true;
  } else {
    return a === b;
  }
}

function shouldKeep<P extends { [key: string]: any }>(
  props0: P,
  props1: P,
  funcName: string
) {
  // if (c1 !== c2) return true;
  // const { children: c0, ...p0 } = props0;
  // const { children: c1, ...p1 } = props1;

  // console.log({ funcName, p0, p1, c0, c1 });

  const na = Object.keys(props1);
  if (na.length === 1 && na[0] === 'children') {
    return false;
  }

  // console.log({ p1 });
  // return compareObjectByJsonStringify(props0, props1);
  return chkEqExcFn(props0, props1);

  // if (
  //   funcName === 'KeyUnitCard' ||
  //   funcName === 'OperationCard' ||
  //   funcName === 'LayerCard' ||
  //   funcName === 'LayerOperationButtton' ||
  //   funcName === 'ControlButton'
  // ) {
  //   return true;
  // }

  for (const key in props1) {
    if (key === 'children') {
      continue;
      if (props1[key] !== props0[key]) {
        // console.log(`props changed`, key, p1, p2);
        return true;
      }
    }
    return false;
  }
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
