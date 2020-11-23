import * as fs from "fs";

export function fsxReadTextFile(fpath: string) {
  return fs.readFileSync(fpath, { encoding: "utf-8" });
}

export function fsxReadJsonFile(fpath: string) {
  const content = fs.readFileSync(fpath, { encoding: "utf-8" });
  return JSON.parse(content);
}

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
