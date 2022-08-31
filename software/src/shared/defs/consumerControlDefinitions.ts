export type IConsumerControlAction = 'Mute' | 'VolumeDown' | 'VolumeUp';

export const consumerControlActionToKeyCodeMap: {
  [key in IConsumerControlAction]: number;
} = {
  Mute: 0x00e2,
  VolumeUp: 0x00e9,
  VolumeDown: 0x00ea,
};

export const consumerControlActionToLabelTextMap: Record<
  IConsumerControlAction,
  string
> = {
  Mute: 'cc_mute',
  VolumeUp: 'cc_vol+',
  VolumeDown: 'cc_vol-',
};

export const consumerControlAssignSelectionSource: IConsumerControlAction[] = [
  'Mute',
  'VolumeDown',
  'VolumeUp',
];
