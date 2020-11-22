import * as fs from "fs";

export function fsxReadTextFile(fpath: string) {
  return fs.readFileSync(fpath, { encoding: "utf-8" });
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
