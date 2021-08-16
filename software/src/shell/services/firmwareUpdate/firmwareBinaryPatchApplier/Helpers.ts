export function convertArrayElementsToBytes(
  arr: (number | boolean | undefined)[],
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

export function padByteArray(
  bytes: number[],
  length: number,
  fallbackValue: number,
): number[] {
  return new Array(length)
    .fill(0)
    .map((_, i) => (i < bytes.length ? bytes[i] : fallbackValue));
}
