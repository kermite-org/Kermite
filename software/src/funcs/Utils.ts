export function flattenArray<T>(arr: T[][]): T[] {
  const res: T[] = [];
  for (const ar of arr) {
    res.push(...ar);
  }
  return res;
}

export function generateNumberSequence(n: number): number[] {
  const res: number[] = [];
  for (let i = 0; i < n; i++) {
    res.push(i);
  }
  return res;
}

export function removeArrayItems<T>(ar: T[], a: T) {
  let i = 0;
  while (i < ar.length) {
    if (ar[i] === a) {
      ar.splice(i, 1);
      continue;
    }
    i++;
  }
}

export function removeArrayItemOne<T>(ar: T[], a: T) {
  let i = 0;
  while (i < ar.length) {
    if (ar[i] === a) {
      ar.splice(i, 1);
      break;
    }
    i++;
  }
}

export function removeArrayItemsMatched<T>(
  ar: T[],
  cond: (a: T) => boolean
): boolean {
  let someRemoved = false;
  for (let i = 0; i < ar.length; i++) {
    if (cond(ar[i])) {
      ar.splice(i, 1);
      someRemoved = true;
      continue;
    }
  }
  return someRemoved;
}

export function createGroupedArrayByKey<
  T extends { [key in K]: any },
  K extends keyof T
>(arr: T[], keyPropName: K): T[][] {
  const bins: { [key: string]: T[] } = {} as any;
  for (const obj of arr) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const key = obj[keyPropName].toString();
    if (!bins[key]) {
      bins[key] = [];
    }
    bins[key].push(obj);
  }
  return Object.keys(bins).map((key) => bins[key]);
}

export function compareObjectByJsonStringify(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function duplicateObjectByJsonStringifyParse<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function addOptionToOptionsArray<T>(
  options: T[] | undefined,
  option: T
): T[] {
  if (options) {
    if (options.includes(option)) {
      return options;
    } else {
      return [...options, option];
    }
  } else {
    return [option];
  }
}

export function removeOptionFromOptionsArray<T>(
  options: T[] | undefined,
  option: T
): T[] | undefined {
  if (options) {
    if (options.includes(option)) {
      const newOptions = options.filter((a) => a !== option);
      return newOptions.length > 0 ? newOptions : undefined;
    } else {
      return options;
    }
  } else {
    return undefined;
  }
}

export function createDictionaryFromKeyValues<K extends string | number, V>(
  arr: [K, V][]
): { [key in K]: V } {
  const obj: { [key in K]: V } = {} as any;
  arr.forEach((el) => {
    const key = el[0];
    const value = el[1];
    obj[key] = value;
  });
  return obj;
}

export function clonePlainOldObject(src: any): any {
  if (src instanceof Array) {
    return src.map(clonePlainOldObject);
  } else if (src instanceof Object) {
    const dst: any = {};
    for (const key in src) {
      dst[key] = clonePlainOldObject(src[key]);
    }
    return dst;
  } else {
    return src;
  }
}

export function sortOrderBy<T>(
  proc: (arg: T) => number,
  method: 'asc' | 'dsc' = 'asc'
): (a: T, b: T) => number {
  if (method === 'asc') {
    return (a, b) => proc(a) - proc(b);
  } else {
    return (a, b) => proc(b) - proc(a);
  }
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

export function linerInterpolateValue(
  val: number,
  s0: number,
  s1: number,
  d0: number,
  d1: number,
  clamp: boolean
) {
  const res = ((val - s0) / (s1 - s0)) * (d1 - d0) + d0;
  if (clamp) {
    const hi = Math.max(d0, d1);
    const lo = Math.min(d0, d1);
    if (res > hi) return hi;
    if (res < lo) return lo;
  }
  return res;
}

export function clampValue(val: number, lo: number, hi: number): number {
  if (val < lo) return lo;
  if (val > hi) return hi;
  return val;
}

export function generateRandomUid(): string {
  // generate guid like identification string
  return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/x/g, (_m) =>
    ((Math.random() * 16) >> 0).toString(16)
  );
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

export function delayMs(n: number) {
  return new Promise((resolve) => setTimeout(resolve, n));
}

export function overwriteObjectProps<T>(dst: T, src: T) {
  for (const key in dst) {
    if (src[key] !== undefined) {
      dst[key] = src[key];
    }
  }
}
