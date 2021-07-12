import {
  createHookInstance,
  endHooks,
  flushHookEffects,
  startHooks,
} from 'qx/hookImpl';
import { IVComponentWrapper } from 'qx/qxinternal_qxcore/types';

const promise = Promise.resolve();
function doLater(fn: () => void) {
  promise.then(fn);
}

function createFunctionComponentWrapper(
  renderFunction: Function,
): IVComponentWrapper {
  const fcName = renderFunction.name;
  return {
    name: fcName,
    mount(self: any, props: any) {
      // console.log('mount', fcName);
      self.fcsig = fcName;
      self.hook = createHookInstance();
      self.renderWithHook = (props: any) => {
        startHooks(self.hook);
        const vnode = renderFunction(props);
        if (vnode) {
          vnode.marker = `${fcName}`;
        }
        endHooks();
        doLater(() => flushHookEffects(self.hook));
        return vnode;
      };
      return self.renderWithHook(props);
    },
    update(self: any, props: any) {
      return self.renderWithHook(props);
    },
    unmount(self: any) {
      // console.log('unmount', fcName);
      flushHookEffects(self.hook, true);
    },
  };
}

type IRenderFunction = Function & {
  __QxFunctionComponentWrapper?: any;
};

export function getFunctionComponentWrapperCached(
  renderFunction: IRenderFunction,
) {
  if (!renderFunction.__QxFunctionComponentWrapper) {
    renderFunction.__QxFunctionComponentWrapper = createFunctionComponentWrapper(
      renderFunction,
    );
  }
  return renderFunction.__QxFunctionComponentWrapper;
}
