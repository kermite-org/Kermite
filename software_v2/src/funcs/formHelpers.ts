export function reflectValue<T extends string>(proc: (value: T) => void) {
  return (e: Event) => {
    proc((e.currentTarget as HTMLInputElement).value as T);
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
