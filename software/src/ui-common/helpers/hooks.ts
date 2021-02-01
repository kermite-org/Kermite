import { Hook } from 'qx';

export function useLocal<T extends object>(arg: T | (() => T)) {
  const initialValue = 'call' in arg ? arg() : arg;
  const [value] = Hook.useState(initialValue);
  return value;
}
