export const enum SystemParameter {
  EmitKeyStroke = 0,
  EmitRealtimeEvents,
  KeyHoldIndicatorLed,
  HeartbeatLed,
  MasterSide,
  SystemLayout,
  SimulatorMode__Deprecated,
  WiringMode,
  GlowActive,
  GlowColor,
  GlowBrightness,
  GlowPattern,
  GlowDirection,
  GlowSpeed,
}

export const NumSystemParameters = 14;

export const enum SystemAction {
  SetEmitKeyStroke = 0,
  SetEmitRealtimeEvents,
  SetKeyHoldIndicatorLed,
  SetHeartbeatLed,
  SetMasterSide,
  SetSystemLayout,
  SetSimulatorMode__Deprecated,
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
