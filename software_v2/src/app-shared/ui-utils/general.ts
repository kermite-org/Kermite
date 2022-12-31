export function windowKeyboardEventEffect(handler: (e: KeyboardEvent) => void) {
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}

// export function fieldSetter<T, K extends keyof T>(obj: T, key: K) {
//   return (value: T[K]) => (obj[key] = value);
// }

export function fieldSetter<T, K extends keyof T>(target: T, fieldName: K) {
  return (value: T[K]) => {
    target[fieldName] = value;
  };
}

export function getFileNameFromPath(path: string) {
  return path.split(/[/\\]/).pop();
}

export function withStopPropagation(handler: (e: Event) => void) {
  return (e: Event) => {
    handler(e);
    e.stopPropagation();
  };
}
