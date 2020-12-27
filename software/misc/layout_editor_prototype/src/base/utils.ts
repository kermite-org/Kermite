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

export function getDist(x0: number, y0: number, x1: number, y1: number) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  return Math.sqrt(dx * dx + dy * dy);
}

export function mapObjectValues<P, Q>(
  src: {
    [key: string]: P;
  },
  proc: (value: P) => Q
): { [key: string]: Q } {
  const dst: { [key: string]: Q } = {};
  for (const key in src) {
    dst[key] = proc(src[key]);
  }
  return dst;
}

export function debounce(targetProc: () => void, ms: number) {
  let timerId: any;
  return () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = 0;
    }
    timerId = setTimeout(targetProc, ms);
  };
}
