export function reflectValue<T extends string>(proc: (value: T) => void) {
  return (
    e: JSX.TargetedEvent<HTMLInputElement | HTMLSelectElement, Event>
  ) => {
    proc((e.currentTarget as HTMLInputElement).value as T);
  };
}

export function reflectChecked(proc: (checked: boolean) => void) {
  return (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
    proc((e.currentTarget as HTMLInputElement).checked as any);
  };
}

export const reflectFloatValue = (destFn: (value: number) => void) => {
  return reflectValue((text: string) => {
    const value = parseFloat(text);
    destFn(value);
  });
};

export function fieldSetter<T, K extends keyof T>(target: T, fieldName: K) {
  return (value: T[K]) => {
    target[fieldName] = value;
  };
}
