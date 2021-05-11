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

export const SystemParameterDefinitions: ICustromParameterSpec[] = [
  {
    type: 'toggle',
    slotIndex: 0,
    label: 'Emit Key Stroke',
    defaultValue: 1,
  },
  {
    type: 'toggle',
    slotIndex: 1,
    label: 'Emit Realtime Events',
    defaultValue: 1,
  },
  {
    type: 'toggle',
    slotIndex: 2,
    label: 'Key Hold LED Output',
    defaultValue: 1,
  },
  {
    type: 'toggle',
    slotIndex: 3,
    label: 'Heartbeat LED Output',
    defaultValue: 1,
  },
  {
    type: 'selection',
    slotIndex: 4,
    label: 'Master Side',
    options: [
      { value: 1, label: 'Left' },
      { value: 2, label: 'Right' },
    ],
    defaultValue: 1,
  },
  {
    type: 'selection',
    slotIndex: 5,
    label: 'System Layout',
    options: [
      { value: 0, label: 'US' },
      { value: 1, label: 'JIS' },
    ],
    defaultValue: 0,
  },
  {
    type: 'toggle',
    slotIndex: 6,
    label: 'Enable Simulator Mode',
    defaultValue: 1,
  },
  {
    type: 'selection',
    slotIndex: 7,
    label: 'Wiring Condition',
    options: [
      { value: 0, label: 'Main' },
      { value: 1, label: 'Alter' },
    ],
    defaultValue: 0,
  },
  {
    slotIndex: 8,
    type: 'toggle',
    label: 'Glow Enabled',
    defaultValue: 0,
  },
  {
    slotIndex: 9,
    type: 'linear',
    label: 'Glow Color',
    defaultValue: 0,
    maxValue: 255, // read from firmware
  },
  {
    slotIndex: 10,
    type: 'linear',
    label: 'Glow Brightness',
    defaultValue: 10,
    maxValue: 255, // read from firmware
  },
  {
    slotIndex: 11,
    type: 'linear',
    label: 'Glow Pattern',
    defaultValue: 0,
    maxValue: 255, // read from firmware
  },
  {
    slotIndex: 12,
    type: 'selection',
    label: 'Glow Direction',
    defaultValue: 0,
    options: [
      { value: 0, label: 'Backword' },
      { value: 1, label: 'Forward' },
    ],
  },
  {
    slotIndex: 13,
    type: 'linear',
    label: 'Glow Speed',
    defaultValue: 0,
    maxValue: 255, // read from firmware
  },
];
