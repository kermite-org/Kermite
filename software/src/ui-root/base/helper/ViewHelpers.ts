export function fieldSetter<T, K extends keyof T>(obj: T, key: K) {
  return (value: T[K]) => (obj[key] = value);
}
