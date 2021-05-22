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
  None = 0,
  GlowOn,
  GlowOff,
  GlowToggle,

  // SetEmitKeyStroke = 0,
  // SetEmitRealtimeEvents,
  // SetKeyHoldIndicatorLed,
  // SetHeartbeatLed,
  // SetMasterSide,

  // SetSystemLayout = 1, // 1:US, 2:JIS
  // SetWiringMode, // 0:Main, 1:Alter
  // ShiftGlowPattern,
  // SetGlowColor,
  // SetGlowBrightness,
  // SetGlowPattern,
  // SetGlowDirection,
  // SetGlowSpeed,
  // ShiftGlowColor,
  // ShiftGlowBrightness,
  // ShiftGlowDirection,
  // ShiftGlowSpeed,
}
