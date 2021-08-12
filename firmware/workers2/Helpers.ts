export function convertArrayElementsToBytes(
  arr: (number | boolean | undefined)[]
): number[] {
  return arr.map((value) => {
    if (value === undefined) {
      return 0;
    }
    if (value === false) {
      return 0;
    }
    if (value === true) {
      return 1;
    }
    if (isFinite(value)) {
      return value;
    }
    return 0;
  });
}

export function padZeros(
  bytes: number[] | undefined,
  length: number
): number[] {
  return new Array(length).fill(0).map((_, i) => bytes?.[i] || 0);
}
