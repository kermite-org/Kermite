export function reflectValue(proc: (value: string) => void) {
  return (e: Event) => {
    proc((e.currentTarget as HTMLInputElement).value);
  };
}

export function reflectFieldValue<T>(target: T, fieldName: keyof T) {
  return (e: Event) => {
    target[fieldName] = (e.currentTarget as HTMLInputElement).value as any;
  };
}

export function reflectFieldChecked<T>(target: T, fieldName: keyof T) {
  return (e: Event) => {
    target[fieldName] = (e.currentTarget as HTMLInputElement).checked as any;
  };
}
