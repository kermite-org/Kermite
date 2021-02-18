import { Hook } from 'qx';
import { copyObjectProps } from '~/shared';
import { LocalStorageHelper } from './LocalStorageHelper';

export function useLocal<T extends object>(arg: T | (() => T)) {
  const initialValue = 'call' in arg ? arg() : arg;
  const [value] = Hook.useState(initialValue);
  return value;
}

export function useFetcher<T>(func: () => Promise<T>, defaultValue: T): T {
  const [value, setValue] = Hook.useState(defaultValue);
  Hook.useEffect(() => {
    func().then((value) => value && setValue(value));
  }, []);
  return value;
}

export function useMemoEx<T extends (...args: any[]) => any>(
  func: T,
  args: Parameters<T>,
): ReturnType<T> {
  return Hook.useMemo(() => func(...args), args);
}

export function usePersistState<T extends {}>(key: string, initialValue: T) {
  const [value] = Hook.useState(initialValue);
  const storageKey = `usePersistState__${key}`;
  Hook.useEffect(() => {
    const savedValue = LocalStorageHelper.readItem<T>(storageKey);
    if (savedValue) {
      copyObjectProps(value, savedValue);
    }
    return () => {
      LocalStorageHelper.writeItem(storageKey, value);
    };
  }, []);
  return value;
}
