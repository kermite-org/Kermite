import { FC } from 'alumina';

export interface ISelectorOption {
  value: string;
  label: string;
}

export interface ISelectorOptionN {
  value: number;
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

export function getSelectionValueCorrected(
  options: ISelectorOption[],
  value: string,
): string {
  if (options.some((it) => it.value === value)) {
    return value;
  }
  if (options.length > 0) {
    return options[0].value;
  }
  return '';
}

export interface ICommonCheckboxViewModel {
  value: boolean;
  setValue(value: boolean): void;
  disabled?: boolean;
}

export interface ICommonSelectorViewModel {
  options: ISelectorOption[];
  value: string;
  setValue(value: string): void;
  disabled?: boolean;
}

export type FcWithClassName = FC<{ className?: string }>;

export type IFeatureEditor<T> = {
  load(value: T): void;
  canSave: boolean;
  save(): T;
  render(): JSX.Element;
};
