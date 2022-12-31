export function reflectValue<T extends string>(proc: (value: T) => void) {
  return (
    e: JSX.TargetedEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
      Event
    >,
  ) => {
    proc((e.currentTarget as HTMLInputElement).value as T);
  };
}

export function reflectChecked(proc: (checked: boolean) => void) {
  return (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
    proc((e.currentTarget as HTMLInputElement).checked as any);
  };
}

export function reflectFieldValue<T>(target: T, fieldName: keyof T) {
  return (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
    target[fieldName] = (e.currentTarget as HTMLInputElement).value as any;
  };
}

export const reflectFloatValue = (destFn: (value: number) => void) => {
  return reflectValue((text: string) => {
    const value = parseFloat(text);
    destFn(value);
  });
};
