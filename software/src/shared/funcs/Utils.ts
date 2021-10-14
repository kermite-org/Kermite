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

export function addArrayItemIfNotExist<T>(arr: T[], value: T) {
  if (!arr.includes(value)) {
    arr.push(value);
  }
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
  cond: (a: T) => boolean,
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
  K extends keyof T,
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
  option: T,
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
  option: T,
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
  arr: [K, V][],
): { [key in K]: V } {
  const res = Object.fromEntries(arr) as { [key in K]: V };
  return res;
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

export const cloneObject = duplicateObjectByJsonStringifyParse;

export function compareString(a: string, b: string) {
  if (a > b) {
    return 1;
  } else if (a < b) {
    return -1;
  } else {
    return 0;
  }
}

export function compareStringOrNumber(a: string | number, b: string | number) {
  if (a > b) {
    return 1;
  } else if (a < b) {
    return -1;
  } else {
    return 0;
  }
}

export function sortOrderBy<T>(
  proc: (arg: T) => string | number,
  method: 'asc' | 'dsc' = 'asc',
): (a: T, b: T) => number {
  if (method === 'asc') {
    return (a, b) => compareStringOrNumber(proc(a), proc(b));
  } else {
    return (a, b) => compareStringOrNumber(proc(b), proc(a));
  }
}

export function mapObjectValues<P, Q>(
  src: {
    [key: string]: P;
  },
  proc: (value: P) => Q,
): { [key: string]: Q } {
  return Object.fromEntries(
    Object.keys(src).map((key) => [key, proc(src[key])]),
  );
}

export function linerInterpolateValue(
  val: number,
  s0: number,
  s1: number,
  d0: number,
  d1: number,
  clamp: boolean,
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
    ((Math.random() * 16) >> 0).toString(16),
  );
}

export function delayMs(n: number) {
  return new Promise((resolve) => setTimeout(resolve, n));
}

export function copyObjectProps<T>(target: T, source: T) {
  for (const key in target) {
    // if (source[key] !== undefined) {
    if (key in source) {
      target[key] = source[key];
    }
  }
}

export function copyObjectPropsRecursive<T>(target: T, source: T) {
  for (const key in target) {
    if (source[key] !== undefined) {
      if (typeof source[key] === 'object' && typeof target[key] === 'object') {
        copyObjectPropsRecursive(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
}

export function makeObjectPropsOverrideRecursive<T>(original: T, input: T): T {
  const merged: T = {} as any;
  for (const key in original) {
    if (input[key] !== undefined) {
      if (typeof original[key] === 'object' && typeof input[key] === 'object') {
        merged[key] = makeObjectPropsOverrideRecursive(
          original[key],
          input[key],
        );
      } else {
        merged[key] = input[key];
      }
    } else {
      merged[key] = original[key];
    }
  }
  return merged;
}

function deg2(value: number) {
  return `0${value}`.slice(-2);
}

export function formatTimeMsToMinSecMs(ms: number) {
  let sec = (ms / 1000) >> 0;
  ms -= sec * 1000;
  const min = (sec / 60) >> 0;
  sec -= min * 60;
  return `${deg2(min)}:${deg2(sec)}:${deg2((ms / 100) >> 0)}`;
}

export function convertDefaultValueToUndefined<T>(
  value: T,
  defaultValue: T,
): T | undefined {
  return value === defaultValue ? undefined : value;
}

export function convertUndefinedToDefaultValue<T>(
  value: T | undefined,
  defaultValue: T,
): T {
  return value === undefined ? defaultValue : value;
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

export const degToRad = (deg: number) => (deg * Math.PI) / 180;
export const radToDeg = (rad: number) => (rad * 180) / Math.PI;

export function rotateCoord(p: { x: number; y: number }, theta: number) {
  const tmpX = p.x * Math.cos(theta) - p.y * Math.sin(theta);
  const tmpY = p.x * Math.sin(theta) + p.y * Math.cos(theta);
  p.x = tmpX;
  p.y = tmpY;
}

export function translateCoord(
  p: { x: number; y: number },
  ax: number,
  ay: number,
) {
  p.x += ax;
  p.y += ay;
}

export function getObjectKeys<T extends {}>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

export function checkValidOptionOrDefault<T extends string>(
  optionValues: T[],
  value: T,
  defaultValue: T,
): T {
  if (optionValues.includes(value)) {
    return value;
  }
  return defaultValue;
}

export function forceChangeFilePathExtension(
  filePath: string,
  extension: string,
) {
  const fileName = filePath.replace(/^.*[\\/]/, '');
  const namePart = fileName.split('.')[0];
  return filePath.replace(fileName, namePart + extension);
}

export function compareArray(ar0: any[], ar1: any[]): boolean {
  return (
    ar0.length === ar1.length && ar0.every((it, index) => ar1[index] === it)
  );
}

export function getArrayDiff<T>(curr: T[], next: T[]): [T[], T[]] {
  const added = next.filter((a) => !curr.includes(a));
  const removed = curr.filter((a) => !next.includes(a));
  return [added, removed];
}

export function generateRandomIdBase62(n: number): string {
  const charactersBase62 =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return generateNumberSequence(n)
    .map((_) => charactersBase62.charAt((Math.random() * 62) >> 0))
    .join('');
}

export function generateUniqueRandomId(
  n: number,
  existingIds: string[],
): string {
  for (let i = 0; i < 100; i++) {
    const projectId = generateRandomIdBase62(n);
    if (!existingIds.includes(projectId)) {
      return projectId;
    }
  }
  throw new Error('failed to generate unique id');
}

export function convertNullToUndefinedRecursive(src: any): any {
  if (src === null) {
    return undefined;
  }
  if (Array.isArray(src)) {
    return src.map(convertNullToUndefinedRecursive);
  } else if (typeof src === 'object') {
    const dst: any = {};
    for (const key in src) {
      dst[key] = convertNullToUndefinedRecursive(src[key]);
    }
    return dst;
  } else {
    return src;
  }
}

export function uniqueArrayItems<T>(arr: T[]): T[] {
  return arr.filter((a, idx) => arr.indexOf(a) === idx);
}

export function uniqueArrayItemsByField<T>(items: T[], fieldKey: keyof T): T[] {
  return items.filter(
    (item) => items.find((it) => it[fieldKey] === item[fieldKey]) === item,
  );
}

export function checkArrayItemsUnique<T>(arr: T[]): boolean {
  return arr.every((a, idx) => arr.indexOf(a) === idx);
}

export function bumpObjectProps<T extends {}>(obj: T, source: T) {
  getObjectKeys(obj).forEach((key) => obj[key]);
  getObjectKeys(source).forEach((key) => (obj[key] = source[key]));
}

export function makeIntegersRange(lo: number, hi: number) {
  return new Array(hi - lo + 1).fill(0).map((_, i) => lo + i);
}

export function getObjectKeyByValue<T extends {}>(
  obj: T,
  value: any,
): string | undefined {
  return Object.keys(obj).find((key) => obj[key as keyof T] === value) as any;
}

export function isNumberInRange(value: number, lo: number, hi: number) {
  return lo <= value && value <= hi;
}

export function splitBytesN(bytes: number[], n: number) {
  const m = Math.ceil(bytes.length / n);
  return Array(m)
    .fill(0)
    .map((_, i) => bytes.slice(i * n, i * n + n));
}

export function mergeModuleObjects<A, B, C, D>(
  ...args: [A, B, C, D]
): A & B & C & D;
export function mergeModuleObjects<A, B, C>(...args: [A, B, C]): A & B & C;
export function mergeModuleObjects<A, B>(...args: [A, B]): A & B;
export function mergeModuleObjects<A>(...args: [A]): A {
  const dest: any = {};
  for (const src of args) {
    Object.getOwnPropertyNames(src).forEach((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(src, key);
      if (descriptor) {
        Object.defineProperty(dest, key, descriptor);
      }
    });
  }
  return dest;
}

export function getMatched(text: string, pattern: RegExp): string | undefined {
  const m = text.match(pattern);
  return m?.[1] ?? undefined;
}
