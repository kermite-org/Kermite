import { duplicateObjectByJsonStringifyParse, ICheckerEx } from '~/shared';

export namespace UiLocalStorage {
  export function removeItem(key: string) {
    localStorage.removeItem(key);
  }
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

  export function readItemSafe<T>(
    key: string,
    schemaChecker: ICheckerEx,
    fallbackSource: T | (() => T),
  ): T {
    const value = readItem<T>(key);
    const errors = schemaChecker(value);
    if (errors) {
      console.error(`invalid persist data for ${key}`);
      console.error(JSON.stringify(errors, null, '  '));
    }
    if (value && !errors) {
      return value;
    }
    if (fallbackSource instanceof Function) {
      return fallbackSource();
    } else {
      return duplicateObjectByJsonStringifyParse(fallbackSource);
    }
  }
}
