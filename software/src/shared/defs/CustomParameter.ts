export type ICustomParameterSpec_Toggle = {
  type: 'toggle';
  slotIndex: number;
  label: string;
  defaultValue: 0 | 1;
};

export type ICustomParameterSpec_Linear = {
  type: 'linear';
  slotIndex: number;
  label: string;
  maxValue: number;
  defaultValue: number;
};

export type ICustomParameterOption = {
  value: number;
  label: string;
};

export type ICustomParameterSpec_Select = {
  type: 'selection';
  slotIndex: number;
  label: string;
  options: ICustomParameterOption[];
  defaultValue: number;
};

export type ICustromParameterSpec =
  | ICustomParameterSpec_Toggle
  | ICustomParameterSpec_Linear
  | ICustomParameterSpec_Select;
