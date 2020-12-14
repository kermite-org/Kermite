export function indexOf<T>(
  a: T[],
  suba: T[],
  aStart: number,
  aEnd: number,
  subaStart: number,
  subaEnd: number,
  eq: (a: T, b: T) => boolean
) {
  let j = subaStart;
  let k = -1;
  const subaLen = subaEnd - subaStart + 1;
  while (aStart <= aEnd) {
    if (eq(a[aStart], suba[j])) {
      if (k < 0) k = aStart;
      j++;
      if (j > subaEnd) return k;
    } else {
      if (aStart + subaLen > aEnd) return -1;
      k = -1;
      j = subaStart;
    }
    aStart++;
  }
  return -1;
}

export function maybeFlattenArray<T>(array: T[]) {
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    if (Array.isArray(item)) {
      return flattenArray(array, array.slice(0, i), i);
    }
  }
  return array;
}

function flattenArray<T>(
  sourceArray: T[],
  targetArray: T[],
  startIndex: number
) {
  for (let i = startIndex; i < sourceArray.length; i++) {
    const item = sourceArray[i];
    if (Array.isArray(item)) {
      flattenArray(item, targetArray, 0);
    } else {
      targetArray.push(item);
    }
  }
  return targetArray;
}
