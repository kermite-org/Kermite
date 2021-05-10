#ifndef __SYSTEM_COMMAND_H__
#define __SYSTEM_COMMAND_H__

static const int NumSystemParameters = 14;

static const int SystemParameterIndexBase = 100;

enum {
  SystemParameter_EmitKeyStroke = SystemParameterIndexBase,
  SystemParameter_EmitRealtimeEvents,
  SystemParameter_KeyHoldIndicatorLed,
  SystemParameter_HeartbeatLed,
  SystemParameter_MasterSide,    //0:unset, 1:left, 2:right
  SystemParameter_SystemLayout,  //0:US, 1:JIS
  SystemParameter_SimulatorMode, //0:STD, 1:Simulator
  SystemParameter_WiringMode,    //0:Main, 1:Alter
  SystemParameter_GlowActive,
  SystemParameter_GlowColor,      //0-12
  SystemParameter_GlowBrightness, //0-255
  SystemParameter_GlowPattern,    //0-10(仮)
  SystemParameter_GlowDirection,  //0-1
  SystemParameter_GlowSpeed,      //0-10(仮)
};

enum {
  SystemAction_SetEmitKeyStroke = SystemParameterIndexBase,
  SystemAction_SetEmitRealtimeEvents,
  SystemAction_SetKeyHoldIndicatorLed,
  SystemAction_SetHeartbeatLed,
  SystemAction_SetMasterSide,
  SystemAction_SetSystemLayout,
  SystemAction_SetSimulatorMode,
  SystemAction_SetWiringMode,
  SystemAction_SetGlowActive,
  SystemAction_SetGlowColor,
  SystemAction_SetGlowBrightness,
  SystemAction_SetGlowPattern,
  SystemAction_SetGlowDirection,
  SystemAction_SetGlowSpeed,

  SystemAction_ShiftGlowColor = 150,
  SystemAction_ShiftGlowBrightness,
  SystemAction_ShiftGlowPattern,
  SystemAction_ShiftGlowDirection,
  SystemAction_ShiftGlowSpeed,
};

#endif
