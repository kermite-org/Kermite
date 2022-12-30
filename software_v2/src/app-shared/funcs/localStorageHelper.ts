export function localStorageHelper_writeItem<T extends {}>(
  key: string,
  obj: T,
) {
  localStorage.setItem(key, JSON.stringify(obj));
}

export function localStorageHelper_readItemSafe<T extends {}>(
  key: string,
): T | undefined {
  const text = localStorage.getItem(key);
  if (text) {
    try {
      return JSON.parse(text);
    } catch (err) {}
  }
  return undefined;
}
