import { qxGlobal } from './qxGlobal';

type IEffectFunc = () => void | (() => void) | Promise<void>;

type IStateSetValue<T> = (value: T | ((arg: T) => T)) => void;
interface IHookStateHolder<T> {
  value: T;
  setValue: IStateSetValue<T>;
}

interface IHookMemoHolder<T> {
  deps?: any[];
  value: T;
}

interface IHookCallbackHolder<T> {
  deps?: any[];
  value: T;
}
interface IHookEffectHolder {
  deps?: any[];
  effectFunc?: IEffectFunc;
  cleanupFunc?: () => void;
}

export interface IHookRefObject<T> {
  current: T | undefined;
}
interface IHookRefHolder<T> {
  refObject: IHookRefObject<T>;
}

export interface IHookInstance {
  holders: any[];
  index: number;
  pendingEffectHolders: IHookEffectHolder[];
}

export function createHookInstance(): IHookInstance {
  return {
    holders: [],
    index: 0,
    pendingEffectHolders: [],
  };
}

let gHookInstance: IHookInstance | undefined = undefined;

function hasDepsChanged(
  oldDeps: any[] | undefined,
  newDeps: any[] | undefined,
): boolean {
  if (!oldDeps || !newDeps) {
    return true;
  }
  for (let i = 0; i < oldDeps.length; i++) {
    if (oldDeps[i] !== newDeps[i]) {
      return true;
    }
  }
  return false;
}

function getHookHolder<T>(): { holder: T; first: boolean } {
  if (!gHookInstance) {
    throw new Error('hook functions called outside render context');
  }
  const hk = gHookInstance;
  let holder = hk.holders[hk.index] as T;
  let first = false;
  if (!holder) {
    holder = hk.holders[hk.index] = {} as T;
    first = true;
  }
  hk.index++;
  return { holder, first };
}

export function useState<T>(initialValue: T): [T, IStateSetValue<T>] {
  const { holder, first } = getHookHolder<IHookStateHolder<T>>();
  if (first) {
    holder.value = initialValue;
    holder.setValue = (arg: T | ((oldValue: T) => T)) => {
      if (typeof arg === 'function') {
        holder.value = (arg as any)(holder.value);
      } else {
        holder.value = arg;
      }
    };
  }
  const { value, setValue } = holder;
  return [value, setValue];
}

export function useLocal<T extends object>(arg: T | (() => T)): T {
  const initialValue = 'call' in arg ? arg() : arg;
  const [value] = useState(initialValue);
  return value;
}

export function useMemo<T>(func: () => T, deps: any[]): T {
  const { holder } = getHookHolder<IHookMemoHolder<T>>();
  const changed = hasDepsChanged(holder.deps, deps);
  if (changed) {
    holder.value = func();
    holder.deps = deps;
  }
  return holder.value;
}

export function useCallback<T extends (...args: any) => any>(
  func: T,
  deps: any[],
): T {
  const { holder } = getHookHolder<IHookCallbackHolder<T>>();
  const changed = hasDepsChanged(holder.deps, deps);
  if (changed) {
    holder.value = func;
    holder.deps = deps;
  }
  return holder.value;
}

export function useEffect(effectFunc: IEffectFunc, deps: any[] | undefined) {
  const { holder } = getHookHolder<IHookEffectHolder>();
  const changed = hasDepsChanged(holder.deps, deps);
  if (changed) {
    holder.effectFunc = effectFunc;
    holder.deps = deps;
    gHookInstance!.pendingEffectHolders.push(holder);
  }
}

export function useInlineEffect(
  effectFunc: IEffectFunc,
  deps: any[] | undefined,
) {
  const { holder } = getHookHolder<IHookEffectHolder>();
  const changed = hasDepsChanged(holder.deps, deps);
  if (changed) {
    const result = effectFunc();
    if (result && typeof result === 'function') {
      holder.cleanupFunc = result;
    }
    holder.deps = deps;
  }
}

export function useRef<T>() {
  const { holder, first } = getHookHolder<IHookRefHolder<T>>();
  if (first) {
    holder.refObject = { current: undefined };
  }
  return holder.refObject;
}

export function startHooks(target: IHookInstance) {
  target.index = 0;
  gHookInstance = target;
}

export function endHooks() {
  gHookInstance = undefined;
}

export function flushHookEffects(target: IHookInstance, all: boolean = false) {
  const holders = (
    all ? target.holders : target.pendingEffectHolders
  ) as IHookEffectHolder[];
  holders.forEach((holder) => {
    if (holder.cleanupFunc) {
      holder.cleanupFunc();
      holder.cleanupFunc = undefined;
    }
    if (holder.effectFunc) {
      const result = holder.effectFunc();
      if (result && typeof result === 'function') {
        holder.cleanupFunc = result;
      }
      qxGlobal.asyncRerenderFlag = true;
      holder.effectFunc = undefined;
    }
  });
  target.pendingEffectHolders = [];
}
