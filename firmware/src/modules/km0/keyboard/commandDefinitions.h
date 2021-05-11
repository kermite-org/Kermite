#ifndef __COMMAND_DEFINITIONS_H__
#define __COMMAND_DEFINITIONS_H__

#include "km0/types.h"

#define NumSystemParameters 14

static const int SystemParameterIndexBase = 0;
static const int ExtraParameterIndexBase = 128;

enum {
  SystemParameter_EmitKeyStroke = 0,
  SystemParameter_EmitRealtimeEvents,
  SystemParameter_KeyHoldIndicatorLed,
  SystemParameter_HeartbeatLed,
  SystemParameter_MasterSide,    //0:left, 1:right
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
typedef struct {
  uint8_t emitKeyStroke;
  uint8_t emitRealtimeEvents;
  uint8_t keyHoldLedOutput;
  uint8_t heartbeatLedOutput;
  uint8_t masterSide;
  uint8_t secondSystemLayoutActive;
  uint8_t simulatorModeActive;
  uint8_t alterAssignsActive;
  uint8_t glowActive;
  uint8_t glowColor;
  uint8_t glowBrightness;
  uint8_t glowPattern;
  uint8_t glowDirection;
  uint8_t glowSpeed;
} T_SystemParametersSet;

enum {
  SystemAction_SetEmitKeyStroke = 0,
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

  SystemAction_ShiftGlowColor = 30,
  SystemAction_ShiftGlowBrightness,
  SystemAction_ShiftGlowPattern,
  SystemAction_ShiftGlowDirection,
  SystemAction_ShiftGlowSpeed,
};

#endif
