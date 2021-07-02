#include "keyScanner_encoders.h"
#include "km0/base/bitOperations.h"
#include "km0/base/utils.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/device/pinObserver.h"
#include "km0/device/system.h"
#include <stdio.h>

#ifndef KM0_ENCODER_SCANNER__NUM_ENCODERS_MAX
#define KM0_ENCODER_SCANNER__NUM_ENCODERS_MAX 1
#endif
#define NumEncodersMax KM0_ENCODER_SCANNER__NUM_ENCODERS_MAX

static const int EncoderPinChangeInterruptPinStateReadWaitTimeUs = 50;

static const int rot_none = 2;
static const int rot_ccw = 0;
static const int rot_cw = 1;

static const int ev_none = 0;
static const int ev_b_low_a_rise = 1;
static const int ev_b_low_a_fall = 2;
static const int ev_b_high_a_rise = 3;
static const int ev_b_high_a_fall = 4;

typedef struct {
  int prev_a;
  int prev_ev;
  uint32_t rots_buf;
  int rots_num;
} EncoderState;

static int numEncoders = 0;
static EncoderConfig *encoderConfigs;
static EncoderState encoderStates[NumEncodersMax];

static int decodeSignalEdgeEvent(int b, int prev_a, int a) {
  bool b_low = b == 0;
  bool b_high = b == 1;
  bool a_rise = !prev_a && a;
  bool a_fall = prev_a && !a;
  if (b_low && a_rise) {
    return ev_b_low_a_rise;
  }
  if (b_low && a_fall) {
    return ev_b_low_a_fall;
  }
  if (b_high && a_rise) {
    return ev_b_high_a_rise;
  }
  if (b_high && a_fall) {
    return ev_b_high_a_fall;
  }
  return ev_none;
}

static void encoderInstance_decodeInputOnPhaseAEdge(EncoderConfig *config, EncoderState *state, int edge) {
  if (EncoderPinChangeInterruptPinStateReadWaitTimeUs > 0) {
    delayUs(EncoderPinChangeInterruptPinStateReadWaitTimeUs);
  }
  int a = digitalIo_read(config->pinA);
  if (a != state->prev_a) {
    int b = digitalIo_read(config->pinB);
    int ev = decodeSignalEdgeEvent(b, state->prev_a, a);
    int rot = rot_none;
    if (state->prev_ev == ev_b_high_a_fall && ev == ev_b_low_a_rise) {
      rot = rot_cw;
    }
    if (state->prev_ev == ev_b_low_a_fall && ev == ev_b_high_a_rise) {
      rot = rot_ccw;
    }
    if (rot != rot_none) {
      bit_spec(state->rots_buf, state->rots_num, rot);
      state->rots_num++;
    }
    state->prev_a = a;
    state->prev_ev = ev;
  }
}

static int encoderInstance_pullRotationEventOne(EncoderState *state) {
  static uint32_t tick = 0;
  if ((++tick & 3) == 0) {
    if (state->rots_num > 0) {
      int rot = state->rots_buf & 1;
      state->rots_buf >>= 1;
      state->rots_num--;
      return rot == rot_cw ? 1 : -1;
    }
  }
  return 0;
}

static void pinObserverCallback(int pin, int edge) {
  for (int i = 0; i < numEncoders; i++) {
    EncoderConfig *config = &encoderConfigs[i];
    EncoderState *state = &encoderStates[i];
    if (pin == config->pinA) {
      encoderInstance_decodeInputOnPhaseAEdge(config, state, edge);
    }
  }
}

void keyScanner_encoders_initialize(uint8_t num, EncoderConfig *_encoderConfigs) {
  for (int i = 0; i < numEncoders; i++) {
    EncoderConfig *config = &encoderConfigs[i];
    pinObserver_unobservePin(config->pinA);
  }

  numEncoders = num;
  encoderConfigs = _encoderConfigs;

  for (int i = 0; i < numEncoders; i++) {
    EncoderConfig *config = &encoderConfigs[i];
    digitalIo_setInputPullup(config->pinA);
    digitalIo_setInputPullup(config->pinB);
    pinObserver_observePin(config->pinA, pinObserverCallback);
  }
}

void keyScanner_encoders_update(uint8_t *keyStateBitFlags) {
  for (int i = 0; i < numEncoders; i++) {
    EncoderConfig *config = &encoderConfigs[i];
    EncoderState *state = &encoderStates[i];
    int dir = encoderInstance_pullRotationEventOne(state);
    utils_writeArrayedBitFlagsBit(keyStateBitFlags, config->scanIndexBase + 0, dir == -1);
    utils_writeArrayedBitFlagsBit(keyStateBitFlags, config->scanIndexBase + 1, dir == 1);
  }
}
