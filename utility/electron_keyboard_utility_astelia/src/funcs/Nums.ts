export namespace Nums {
  export function vmap(
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

  export function clamp(val: number, lo: number, hi: number): number {
    if (val < lo) return lo;
    if (val > hi) return hi;
    return val;
  }
}
