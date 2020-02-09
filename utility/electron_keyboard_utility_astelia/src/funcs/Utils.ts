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

export function compareObjectByStringify(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function duplicateObjectByStringify<T>(obj: T): T {
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
