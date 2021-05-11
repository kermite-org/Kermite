export const enum SystemParameter {
  EmitKeyStroke = 0,
  EmitRealtimeEvents,
  KeyHoldIndicatorLed,
  HeartbeatLed,
  MasterSide,
  SystemLayout,
  SimulatorMode,
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
  SetSimulatorMode,
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
