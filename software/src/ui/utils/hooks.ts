import { useLocal, useState, useEffect, useMemo } from 'alumina';
import { cloneObject, copyObjectProps } from '~/shared';
import { UiLocalStorage } from '~/ui/base';

export function useFetcher<T>(func: () => Promise<T>, defaultValue: T): T {
  const [value, setValue] = useState(defaultValue);
  useEffect(() => {
    func().then((value) => value && setValue(value));
  }, []);
  return value;
}

export function useFetcher2<T>(
  func: () => Promise<T> | undefined,
  deps: any[],
): T | undefined {
  const [value, setValue] = useState<T | undefined>(undefined);
  useEffect(() => {
    const promise = func();
    if (promise) {
      promise.then((value) => setValue(value));
    } else {
      setValue(undefined);
    }
  }, deps);
  return value;
}

export function useMemoEx<T extends (...args: any[]) => any>(
  func: T,
  args: Parameters<T>,
): ReturnType<T> {
  return useMemo(() => func(...args), args);
}

export function usePersistState<T extends {}>(key: string, initialValue: T) {
  const value = useLocal(initialValue);
  const storageKey = `usePersistState__${key}`;
  useEffect(() => {
    const savedValue = UiLocalStorage.readItem<T>(storageKey);
    if (savedValue) {
      copyObjectProps(value, savedValue);
    }
    return () => {
      UiLocalStorage.writeItem(storageKey, value);
    };
  }, []);
  return value;
}

export function usePersistState2<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] {
  const [value, setValue] = useState(initialValue);
  const storageKey = `usePersistState2__${key}`;
  useEffect(() => {
    const savedValue = UiLocalStorage.readItem<T>(storageKey);
    if (savedValue !== undefined) {
      setValue(savedValue);
    }
    return () => {
      UiLocalStorage.writeItem(storageKey, value);
    };
  }, []);
  return [value, setValue];
}

export function useEventSource<T extends {}>(
  source: { subscribe: (listener: (value: Partial<T>) => void) => () => void },
  initialValue: T,
): T {
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    return source.subscribe((newValuePartial) => {
      setValue((oldValue) => ({ ...oldValue, ...newValuePartial }));
    });
  }, []);
  return value;
}

export function useCloned(obj: any) {
  return useMemo(() => cloneObject(obj), [obj]);
}
