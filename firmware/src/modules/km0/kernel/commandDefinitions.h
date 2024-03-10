#pragma once

#include "km0/types.h"

#define NumSystemParameters 11

enum {
  SystemParameter_EmitRealtimeEvents = 0,
  SystemParameter_KeyHoldIndicatorLed,
  SystemParameter_HeartbeatLed,
  SystemParameter_MasterSide,   //0:left, 1:right
  SystemParameter_SystemLayout, //0:US, 1:JIS
  SystemParameter_WiringMode,   //0:Main, 1:Alter
  SystemParameter_GlowActive,
  SystemParameter_GlowColor,      //0-12
  SystemParameter_GlowBrightness, //0-255
  SystemParameter_GlowPattern,    //0-10(仮)
  SystemParameter_DebounceWaitMs, //0-250
};
typedef struct {
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
  uint8_t debounceWaitMs;
} T_SystemParametersSet;

enum {
  SystemAction_None = 0,
  SystemAction_GlowToggle = 1,
  SystemAction_GlowPatternRoll = 2,
  SystemAction_GlowColorPrev = 3,
  SystemAction_GlowColorNext = 4,
  SystemAction_GlowBrightnessMinus = 5,
  SystemAction_GlowBrightnessPlus = 6,
  SystemAction_ResetToDfuMode = 0x7e,
  SystemAction_SystemLayoutSetPrimary = 7,
  SystemAction_SystemLayoutSetSecondary = 8,
  SystemAction_SystemLayoutNext = 9,
  SystemAction_RoutingChannelSetMain = 10,
  SystemAction_RoutingChannelSetAlter = 11,
  SystemAction_RoutingChannelNext = 12,
};
