export function arrayToDictionary<
  T extends { [Key in K]: string },
  K extends keyof T
>(elements: T[], keyPropName: K): { [key: string]: T } {
  const obj: { [key: string]: T } = {};
  for (const el of elements) {
    const key = el[keyPropName];
    obj[key] = el;
  }
  return obj;
}

export function arrayToIdIndexMap<
  T extends { [Key in K]: string },
  K extends keyof T
>(elements: T[], keyPropName: K): { [key: string]: number } {
  const obj: { [key: string]: number } = {};
  elements.forEach((el, index) => {
    const key = el[keyPropName];
    obj[key] = index;
  });
  return obj;
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
      const newOptions = options.filter(a => a !== option);
      return newOptions.length > 0 ? newOptions : undefined;
    } else {
      return options;
    }
  } else {
    return undefined;
  }
}

export function diffArray<T>(
  prev: T[],
  curr: T[]
): {
  added: T[];
  removed: T[];
} {
  const removed = prev.filter(a => !curr.includes(a));
  const added = curr.filter(a => !prev.includes(a));
  return { added, removed };
}

export function findFirst<T, R>(
  values: T[],
  mapper: (value: T) => R
): R | undefined {
  for (const value of values) {
    const result = mapper(value);
    if (result) {
      return result;
    }
  }
  return undefined;
}

export function createDictionaryFromKeyValues<K extends string | number, V>(
  arr: [K, V][]
): { [key in K]: V } {
  const obj: { [key in K]: V } = {} as any;
  arr.forEach(el => {
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
