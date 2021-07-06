import {
  createHookInstance,
  endHooks,
  flushHookEffects,
  startHooks,
} from './hookImpl';

const promise = Promise.resolve();
function doLater(fn: () => void) {
  promise.then(fn);
}

function createFunctionComponentWrapper(renderFunction: Function) {
  return {
    mount(self: any) {
      self.hook = createHookInstance();
      self.renderWithHook = (props: any) => {
        startHooks(self.hook);
        const vnode = renderFunction(props);
        if (vnode) {
          vnode.marker = renderFunction.name;
        }
        endHooks();
        doLater(() => flushHookEffects(self.hook));
        return vnode;
      };
      self.render(self.renderWithHook(self.props));
    },
    patch(self: any) {
      self.render(self.renderWithHook(self.props));
    },
    unmount(self: any) {
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
