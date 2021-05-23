export const NumSystemParameters = 13;

export const enum SystemParameter {
  EmitKeyStroke = 0,
  EmitRealtimeEvents,
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
  | 'GlowBrightnessPlus';

export const systemActionToCodeMap: { [key in SystemAction]: number } = {
  None: 0,
  GlowToggle: 1,
  GlowPatternRoll: 2,
  GlowColorPrev: 3,
  GlowColorNext: 4,
  GlowBrightnessMinus: 5,
  GlowBrightnessPlus: 6,
};

export const systemActionToLabelTextMap: { [key in SystemAction]: string } = {
  None: 'none',
  GlowToggle: 'led on^',
  GlowPatternRoll: 'led p>',
  GlowColorPrev: 'led <c',
  GlowColorNext: 'led c>',
  GlowBrightnessMinus: 'led b-',
  GlowBrightnessPlus: 'led b+',
};

export const systemActionAssignSelectionSource: SystemAction[] = [
  'GlowToggle',
  'GlowBrightnessMinus',
  'GlowBrightnessPlus',
  'GlowColorPrev',
  'GlowColorNext',
  'GlowPatternRoll',
];
