export const NumSystemParameters = 12;

export const enum SystemParameter {
  EmitRealtimeEvents = 0,
  KeyHoldIndicatorLed,
  HeartbeatLed,
  MasterSide,
  SystemLayout,
  WiringMode,
  GlowActive,
  GlowColor,
  GlowBrightness,
  GlowPattern,
  GlowDirection,
  GlowSpeed,
}

export type SystemAction =
  | 'None'
  | 'GlowToggle'
  | 'GlowPatternRoll'
  | 'GlowColorPrev'
  | 'GlowColorNext'
  | 'GlowBrightnessMinus'
  | 'GlowBrightnessPlus'
  | 'ResetToDfuMode';

export const systemActionToCodeMap: { [key in SystemAction]: number } = {
  None: 0,
  GlowToggle: 1,
  GlowPatternRoll: 2,
  GlowColorPrev: 3,
  GlowColorNext: 4,
  GlowBrightnessMinus: 5,
  GlowBrightnessPlus: 6,
  ResetToDfuMode: 0x7e,
};

export const systemActionToLabelTextMap: { [key in SystemAction]: string } = {
  None: 'none',
  GlowToggle: 'led on^',
  GlowPatternRoll: 'led p>',
  GlowColorPrev: 'led <c',
  GlowColorNext: 'led c>',
  GlowBrightnessMinus: 'led b-',
  GlowBrightnessPlus: 'led b+',
  ResetToDfuMode: 'dfu',
};

export const systemActionAssignSelectionSource: SystemAction[] = [
  'GlowToggle',
  'GlowBrightnessMinus',
  'GlowBrightnessPlus',
  'GlowColorPrev',
  'GlowColorNext',
  'GlowPatternRoll',
  'ResetToDfuMode',
];
