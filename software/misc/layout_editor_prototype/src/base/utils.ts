export function createDictionaryFromKeyValues<T>(
  src: [string, T][]
): { [key in string]: T } {
  const obj: { [key in string]: T } = {};
  src.forEach(([k, v]) => {
    obj[k] = v;
  });
  return obj;
}
