import { SystemAction } from '../domain-base';

export const NumSystemParameters = 10;

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
}

export const systemActionToCodeMap: { [key in SystemAction]: number } = {
  None: 0,
  GlowToggle: 1,
  GlowPatternRoll: 2,
  GlowColorPrev: 3,
  GlowColorNext: 4,
  GlowBrightnessMinus: 5,
  GlowBrightnessPlus: 6,
  ResetToDfuMode: 0x7e,
  SystemLayoutSetPrimary: 7,
  SystemLayoutSetSecondary: 8,
  SystemLayoutNext: 9,
  RoutingChannelSetMain: 10,
  RoutingChannelSetAlter: 11,
  RoutingChannelNext: 12,
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
  SystemLayoutSetPrimary: 'sl-US',
  SystemLayoutSetSecondary: 'sl-JIS',
  SystemLayoutNext: 'sl-toggle',
  RoutingChannelSetMain: 'rc-Main',
  RoutingChannelSetAlter: 'rc-Alter',
  RoutingChannelNext: 'rc-toggle',
};

export const systemActionAssignSelectionSource: SystemAction[] = [
  'GlowToggle',
  'GlowBrightnessMinus',
  'GlowBrightnessPlus',
  'GlowColorPrev',
  'GlowColorNext',
  'GlowPatternRoll',
  // 'ResetToDfuMode',
  'SystemLayoutSetPrimary',
  'SystemLayoutSetSecondary',
  'SystemLayoutNext',
  'RoutingChannelSetMain',
  'RoutingChannelSetAlter',
  'RoutingChannelNext',
];
