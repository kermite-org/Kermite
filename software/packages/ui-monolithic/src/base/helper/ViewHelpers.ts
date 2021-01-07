export function combineClasses(...classNames: (string | undefined)[]) {
  return classNames.filter((a) => !!a).join(' ');
}

export function fieldSetter<T, K extends keyof T>(obj: T, key: K) {
  return (value: T[K]) => (obj[key] = value);
}
