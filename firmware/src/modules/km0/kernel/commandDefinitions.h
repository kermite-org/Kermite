#ifndef __COMMAND_DEFINITIONS_H__
#define __COMMAND_DEFINITIONS_H__

#include "km0/types.h"

#define NumSystemParameters 13

// static const int SystemParameterIndexBase = 0;
// static const int ExtraParameterIndexBase = 128;

enum {
  SystemParameter_EmitKeyStroke = 0,
  SystemParameter_EmitRealtimeEvents,
  SystemParameter_KeyHoldIndicatorLed,
  SystemParameter_HeartbeatLed,
  SystemParameter_MasterSide,   //0:left, 1:right
  SystemParameter_SystemLayout, //0:None(fallback to US), 1:US, 2:JIS
  SystemParameter_WiringMode,   //0:Main, 1:Alter
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
  uint8_t systemLayout;
  uint8_t wiringMode;
  uint8_t glowActive;
  uint8_t glowColor;
  uint8_t glowBrightness;
  uint8_t glowPattern;
  uint8_t glowDirection;
  uint8_t glowSpeed;
} T_SystemParametersSet;

enum {
  SystemAction_None = 0,
  SystemAction_GlowOn,
  SystemAction_GlowOff,
  SystemAction_GlowToggle,
};

#endif
