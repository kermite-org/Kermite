export function createDictionaryFromKeyValues<T>(
  src: [string, T][]
): { [key in string]: T } {
  const obj: { [key in string]: T } = {};
  src.forEach(([k, v]) => {
    obj[k] = v;
  });
  return obj;
}

export function compareObjectByJsonStringify(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function duplicateObjectByJsonStringifyParse<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function clamp(val: number, lo: number, hi: number) {
  if (val < lo) {
    return lo;
  } else if (val > hi) {
    return hi;
  } else {
    return val;
  }
}
