import { useState, useEffect } from "alumina";

export function useFetcher<T>(
  func: () => Promise<T>,
  defaultValue: T,
  deps: any[] = []
): T {
  const [value, setValue] = useState(defaultValue);
  useEffect(() => {
    func().then((value) => value && setValue(value));
  }, deps);
  return value;
}
