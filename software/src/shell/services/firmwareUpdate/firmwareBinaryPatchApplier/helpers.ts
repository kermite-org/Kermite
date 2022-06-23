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

export function stringToEmbedBytes(text: string, length: number): number[] {
  return new Array(length).fill(0).map((_, i) => text.charCodeAt(i) || 0);
}

export function isStringPrintableAscii(text: string) {
  return /^[\x20-\x7F]*$/.test(text);
}

export function replaceArrayContent(
  dst: number[],
  dstOffset: number,
  src: number[],
) {
  for (let i = 0; i < src.length; i++) {
    dst[dstOffset + i] = src[i];
  }
}
