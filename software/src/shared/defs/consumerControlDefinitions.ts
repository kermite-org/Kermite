//マウスのボタン/スクロールのアサインを低コストで暫定対応実装するため
//ConsumerControlのアサイン領域にマウスボタンのアサインを混ぜ込む
//本来的には独立したアサイン領域と伝達経路を確保すべき

export type IConsumerControlAction =
  | 'Mute'
  | 'VolumeDown'
  | 'VolumeUp'
  | 'MouseButtonLeft'
  | 'MouseButtonRight'
  | 'MouseButtonCenter'
  | 'MouseButtonBack'
  | 'MouseButtonForward'
  | 'MouseWheelUp'
  | 'MouseWheelDown';

export const consumerControlActionToKeyCodeMap: {
  [key in IConsumerControlAction]: number;
} = {
  Mute: 0x00e2,
  VolumeUp: 0x00e9,
  VolumeDown: 0x00ea,
  MouseButtonLeft: 1,
  MouseButtonRight: 2,
  MouseButtonCenter: 3,
  MouseButtonBack: 4,
  MouseButtonForward: 5,
  MouseWheelUp: 6,
  MouseWheelDown: 7,
};

export const consumerControlActionToLabelTextMap: Record<
  IConsumerControlAction,
  string
> = {
  Mute: 'cc_mute',
  VolumeUp: 'cc_vol+',
  VolumeDown: 'cc_vol-',
  MouseButtonLeft: 'mb_left',
  MouseButtonCenter: 'mb_center',
  MouseButtonRight: 'mb_right',
  MouseButtonBack: 'mb_back',
  MouseButtonForward: 'mb_forward',
  MouseWheelUp: 'mw_up',
  MouseWheelDown: 'mw_down',
};

export const consumerControlAssignSelectionSource: IConsumerControlAction[] = [
  'Mute',
  'VolumeDown',
  'VolumeUp',
  'MouseButtonLeft',
  'MouseButtonCenter',
  'MouseButtonRight',
  'MouseButtonBack',
  'MouseButtonForward',
  'MouseWheelUp',
  'MouseWheelDown',
];
