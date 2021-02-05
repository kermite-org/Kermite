export interface ISelectorOption {
  value: string;
  label: string;
}
export interface ISelectorSource {
  options: ISelectorOption[];
  value: string;
  setValue(value: string): void;
}

export function makePlainSelectorOption(source: string): ISelectorOption {
  return {
    value: source,
    label: source,
  };
}
