export function copyObjectProps<T extends {}>(target: T, source: T) {
  for (const key in target) {
    if (key in source) {
      target[key] = source[key];
    }
  }
}
