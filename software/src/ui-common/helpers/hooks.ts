import { Hook } from 'qx';

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
