import { useEffect, useState } from "react";

export function useEffectAsync(fn: () => Promise<void>, deps: any[]) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => void fn(), deps);
}

export function useAsyncResource<T>(fn: () => Promise<T>, deps: any[]) {
  const [value, setValue] = useState<T | undefined>(undefined);
  useEffectAsync(async () => {
    const newValue = await fn();
    setValue(newValue);
  }, deps);
  return value;
}
