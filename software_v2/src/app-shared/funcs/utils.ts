export function copyObjectProps<T extends {}>(target: T, source: T) {
  for (const key in target) {
    if (key in source) {
      target[key] = source[key];
    }
  }
}

export function compareObjectByJsonStringify(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b);
}
