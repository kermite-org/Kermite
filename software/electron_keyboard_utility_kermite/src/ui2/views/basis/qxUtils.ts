import { useMemo, useCallback } from 'dyo';

export function useViewModel<T>(Klass: new () => T) {
  return useMemo(() => new Klass(), []);
}

export function createClosureComponent<T>(
  proc: () => (props: T) => JSX.Element | null
): (props: T) => JSX.Element | null {
  return (props: T) => {
    const renderProc = useCallback(proc(), []);
    return renderProc(props);
  };
}

export function createClosureComponent2<T>(
  renderClosure: (props: T) => () => JSX.Element | null
): (props: T) => JSX.Element | null {
  return (props: T) => {
    const durablePropObject = useMemo(() => ({} as T));
    for (const _key in props) {
      const key = _key as keyof T;
      durablePropObject[key] = props[key];
    }
    const renderProc = useCallback(renderClosure(durablePropObject), []);
    return renderProc();
  };
}
