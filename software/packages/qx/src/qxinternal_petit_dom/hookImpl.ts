import { qxGlobal } from '../qxGlobal';

// type IPlainFunc = () => void;
type IUseSideEffectFunc = (() => void) | (() => boolean);

// export
interface IHook {
  useMemo<T>(func: () => T, deps: any[]): T;
  useSideEffect(func: IUseSideEffectFunc, deps?: any[]): void;
  useState<T>(initialValue: T): [T, (value: T) => void];
  // useLocal<T>(func: () => T): T;
  // useChecker<T>(value: T, func: IPlainFunc): void;
  // useOnMount(func: IPlainFunc): void;
  // useOnUnmount(func: IPlainFunc): void;
  // useOnUpdate(func: IPlainFunc): void;
  internal_resetIndex(): void;
}

function compareArrayShallow(ar1: any[], ar2: any[]): boolean {
  if (!Array.isArray(ar1) || !Array.isArray(ar2)) {
    return ar1 === ar2;
  }
  if (ar1.length !== ar2.length) {
    return false;
  }
  for (let i = 0; i < ar1.length; i++) {
    if (ar1[i] !== ar2[i]) {
      return false;
    }
  }
  return true;
}

interface IHookMemoHolder<T> {
  deps: any[];
  value: T;
}

interface IHookEffectHolder {
  deps: any[];
}

interface IHookStateHolder<T> {
  value: T;
  setValue: (value: T) => void;
}

// export
function createHookInstance(): IHook {
  const holders: any[] = [];
  let idx = 0;

  // let funcOnMount: IPlainFunc | undefined;
  // let funcOnUnmount: IPlainFunc | undefined;
  // let funcOnUpdate: IPlainFunc | undefined;

  const hook: IHook = {
    useMemo<T>(func: () => T, deps: any[]): T {
      const holder = holders[idx] as IHookMemoHolder<T>;
      const changed = !holder || !compareArrayShallow(holder.deps, deps);
      if (changed) {
        holders[idx] = {
          value: func(),
          deps: deps || [],
        };
      }
      return holders[idx++].value;
    },
    // ReactとuseEffectと仕様が異なるため注意
    // useSideEffedtにわたすフック関数の戻り値がtrueの場合再描画を行う
    useSideEffect(func: IUseSideEffectFunc, deps?: any[]) {
      const holder = holders[idx] as IHookEffectHolder;
      const changed =
        !holder || !deps || !compareArrayShallow(holder.deps, deps);
      if (changed) {
        const reqRerender = func();
        if (reqRerender) {
          qxGlobal.hookRerenderFlag = true;
        }
        holders[idx] = {
          deps: deps || [],
        };
      }
      idx++;
    },
    useState<T>(initialValue: T): [T, (value: T) => void] {
      let holder = holders[idx] as IHookStateHolder<T>;
      if (!holder) {
        holder = holders[idx] = {
          value: initialValue,
          setValue: (v: T) => (holder.value = v),
        };
      }
      idx++;
      const { value, setValue } = holder;
      return [value, setValue];
    },
    // useLocal<T>(func: () => T): T {
    //   if (!(idx in holders)) {
    //     holders[idx] = func();
    //   }
    //   return holders[idx++];
    // },
    // useChecker<T>(value: T, func: IPlainFunc) {
    //   if (value !== holders[idx]) {
    //     // (idx in values) && func()
    //     func();
    //     holders[idx] = value;
    //   }
    //   idx++;
    // },
    internal_resetIndex() {
      idx = 0;
    },
    // useOnMount: (func: IPlainFunc) => (funcOnMount = func),
    // useOnUnmount: (func: IPlainFunc) => (funcOnUnmount = func),
    // useOnUpdate: (func: IPlainFunc) => (funcOnUpdate = func)
  };

  return hook;
}

// export function withHook<P>(componentFunc: (props: P) => JSX.Element) {
//   return (props: P) => {
//     return () => {
//       idx = 0;
//       gHookInstance = hook;
//       return componentFunc(props);
//     }
//     // return {
//     //   didMount: () => funcOnMount?.(),
//     //   didUpdate: () => funcOnUpdate?.(),
//     //   willUnmount: () => funcOnUnmount?.(),
//     //   render: () => {
//     //     idx = 0;
//     //     gHookInstance = hook;
//     //     return componentFunc(props);
//     //   }
//     // };
//   };
// }

let gHookInstance: IHook;

// export
function switchGlobalHookInstance(hook: IHook) {
  gHookInstance = hook;
  hook.internal_resetIndex();
}

// export
const Hook: IHook = {
  useMemo<T>(func: () => T, deps: any[]): T {
    return gHookInstance.useMemo(func, deps);
  },
  useSideEffect(func: IUseSideEffectFunc, deps?: any[]): void {
    // gHookInstance.useEffect(func, deps);
    qxGlobal.hookEffectFuncs.push(() =>
      gHookInstance.useSideEffect(func, deps),
    );
  },
  useState<T>(initialValue: T): [T, (value: T) => void] {
    return gHookInstance.useState(initialValue);
  },
  // useLocal<T>(func: () => T): T {
  //   return gHookInstance.useLocal(func);
  // },
  // useChecker<T>(value: T, func: IPlainFunc): void {
  //   return gHookInstance.useChecker(value, func);
  // },
  // useOnMount(func: IPlainFunc): void {
  //   return gHookInstance.useOnMount(func);
  // },
  // useOnUnmount(func: IPlainFunc): void {
  //   return gHookInstance.useOnUnmount(func);
  // },
  // useOnUpdate(func: IPlainFunc): void {
  //   return gHookInstance.useOnUpdate(func);
  // }
  internal_resetIndex() {},
};
