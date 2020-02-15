export namespace Arrays {
  export function findFirst<T>(ar: T[], cond: (t: T) => boolean): T | null {
    return ar.find(cond) || null;
  }

  export function findLast<T>(ar: T[], cond: (t: T) => boolean): T | null {
    for (let i = ar.length - 1; i >= 0; i--) {
      if (cond(ar[i])) {
        return ar[i];
      }
    }
    return null;
  }

  export function flatten<T>(arr: T[][]): T[] {
    const res: T[] = [];
    for (const ar of arr) {
      res.push(...ar);
    }
    return res;
  }

  export function iota(n: number): number[] {
    const res: number[] = [];
    for (let i = 0; i < n; i++) {
      res.push(i);
    }
    return res;
  }

  export function initArray<T>(num: number, proc: (i: number) => T): T[] {
    return iota(num).map(proc);
  }

  export function remove<T>(ar: T[], a: T) {
    let i = 0;
    while (i < ar.length) {
      if (ar[i] === a) {
        ar.splice(i, 1);
        continue;
      }
      i++;
    }
  }

  export function removeIf<T>(ar: T[], cond: (a: T) => boolean) {
    const index = ar.findIndex(cond);
    if (index >= 0) {
      ar.splice(index, 1);
    }
  }
}
