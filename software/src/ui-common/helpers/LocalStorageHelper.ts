export namespace LocalStorageHelper {
  export function writeItem<T>(key: string, value: T) {
    const text = JSON.stringify(value);
    localStorage.setItem(key, text);
  }

  export function readItem<T>(key: string): T | undefined {
    const text = localStorage.getItem(key);
    if (text) {
      try {
        return JSON.parse(text);
      } catch (error) {
        console.error(`invalid local storage data for ${key}`);
      }
    }
    return undefined;
  }
}
