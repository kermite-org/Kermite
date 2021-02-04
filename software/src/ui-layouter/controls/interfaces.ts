export interface ISelectOption {
  value: string;
  label: string;
}

export interface ICommonSelectorViewModel {
  options: ISelectOption[];
  value: string;
  setValue(value: string): void;
  disabled?: boolean;
}

export interface ICommonCheckboxViewModel {
  value: boolean;
  setValue(value: boolean): void;
  disabled?: boolean;
}
