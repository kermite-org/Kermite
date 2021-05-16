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

export const enum SystemAction {
  SetEmitKeyStroke = 0,
  SetEmitRealtimeEvents,
  SetKeyHoldIndicatorLed,
  SetHeartbeatLed,
  SetMasterSide,
  SetSystemLayout,
  SetWiringMode,
  SetGlowActive,
  SetGlowColor,
  SetGlowBrightness,
  SetGlowPattern,
  SetGlowDirection,
  SetGlowSpeed,

  ShiftGlowColor = 30,
  ShiftGlowBrightness,
  ShiftGlowPattern,
  ShiftGlowDirection,
  ShiftGlowSpeed,
}
