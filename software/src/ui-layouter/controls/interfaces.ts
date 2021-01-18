export interface ISelectOption {
  id: string;
  text: string;
}

export interface ICommonSelectorViewModel {
  options: ISelectOption[];
  choiceId: string;
  setChoiceId(key: string): void;
  disabled?: boolean;
}

export interface ICommonCheckboxViewModel {
  value: boolean;
  setValue(value: boolean): void;
  disabled?: boolean;
}
