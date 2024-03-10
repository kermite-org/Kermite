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

export type ICustomParameterSpec_NumberEdit = {
  type: 'numberEdit';
  slotIndex: number;
  label: string;
  minValue: number;
  maxValue: number;
  defaultValue: number;
  unit: string;
};

export type ICustomParameterSpec =
  | ICustomParameterSpec_Toggle
  | ICustomParameterSpec_Linear
  | ICustomParameterSpec_Select
  | ICustomParameterSpec_NumberEdit;

export const SystemParameterDefinitions: ICustomParameterSpec[] = [
  {
    type: 'toggle',
    slotIndex: 0,
    label: 'Emit Realtime Events',
    defaultValue: 1,
  },
  {
    type: 'toggle',
    slotIndex: 1,
    label: 'Key Hold LED Output',
    defaultValue: 1,
  },
  {
    type: 'toggle',
    slotIndex: 2,
    label: 'Heartbeat LED Output',
    defaultValue: 1,
  },
  {
    type: 'selection',
    slotIndex: 3,
    label: 'Master Side',
    options: [
      { value: 0, label: 'Left' },
      { value: 1, label: 'Right' },
    ],
    defaultValue: 0,
  },
  {
    type: 'selection',
    slotIndex: 4,
    label: 'System Layout',
    options: [
      { value: 1, label: 'US' },
      { value: 2, label: 'JIS' },
    ],
    defaultValue: 0,
  },
  {
    type: 'selection',
    slotIndex: 5,
    label: 'Wiring Condition',
    options: [
      { value: 0, label: 'Main' },
      { value: 1, label: 'Alter' },
    ],
    defaultValue: 0,
  },
  {
    slotIndex: 6,
    type: 'toggle',
    label: 'Glow Enabled',
    defaultValue: 0,
  },
  {
    slotIndex: 7,
    type: 'linear',
    label: 'Glow Color',
    defaultValue: 0,
    maxValue: 255, // read from firmware
  },
  {
    slotIndex: 8,
    type: 'linear',
    label: 'Glow Brightness',
    defaultValue: 10,
    maxValue: 255, // read from firmware
  },
  {
    slotIndex: 9,
    type: 'linear',
    label: 'Glow Pattern',
    defaultValue: 0,
    maxValue: 255, // read from firmware
  },
  {
    slotIndex: 10,
    type: 'numberEdit',
    label: 'Debouncing Wait',
    minValue: 0,
    maxValue: 200,
    defaultValue: 0,
    unit: 'ms',
  },
];

export function getSystemParameterDefinitionBySystemParameterKey(
  systemParameterKey: string,
): ICustomParameterSpec | undefined {
  const keys = [
    'emitRealtimeEvents',
    'keyHoldIndicatorLed',
    'heartbeatLed',
    'masterSide',
    'systemLayout',
    'wiringMode',
    'glowActive',
    'glowColor',
    'glowBrightness',
    'glowPattern',
    'debounceWaitMs',
  ];
  const index = keys.indexOf(systemParameterKey);
  if (index >= 0) {
    return SystemParameterDefinitions[index];
  }
  return undefined;
}
