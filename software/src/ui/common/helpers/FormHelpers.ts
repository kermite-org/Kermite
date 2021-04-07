export function reflectValue<T extends string>(proc: (value: T) => void) {
  return (e: Event) => {
    proc((e.currentTarget as HTMLInputElement).value as T);
  };
}

export function reflectChecked(proc: (checked: boolean) => void) {
  return (e: Event) => {
    proc((e.currentTarget as HTMLInputElement).checked as any);
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
