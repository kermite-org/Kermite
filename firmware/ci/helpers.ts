export function getMatched(text: string, pattern: RegExp): string | undefined {
  const m = text.match(pattern);
  return (m && m[1]) || undefined;
}

export function checkHasFields<T>(obj: T, keys: (keyof T)[]) {
  return keys.every((key) => key in obj);
}

export function compareObjectByJsonStringifyParse(a: any, b: any) {
  return JSON.stringify(a) == JSON.stringify(b);
}

export function createObjectFromKeyValues<K extends string | number, V>(
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

export function uniqueArrayItems<T>(arr: T[]): T[] {
  return arr.filter((a, idx) => arr.indexOf(a) === idx);
}

export function stringifyArray(ar: any[]) {
  return `[${ar.join(", ")}]`;
}

export function arrayCount<T>(ar: T[], cond: (arg: T) => boolean) {
  return ar.filter(cond).length;
}

export const puts = console.log;
