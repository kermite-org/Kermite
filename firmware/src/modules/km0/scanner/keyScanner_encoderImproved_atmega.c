#include "keyScanner_encoderBasic.h"
#include "km0/base/bitOperations.h"
#include "km0/base/utils.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/device/system.h"
#include <avr/interrupt.h>
#include <stdio.h>

#ifndef KM0_ENCODER_SCANNER__NUM_ENCODERS_MAX
#define KM0_ENCODER_SCANNER__NUM_ENCODERS_MAX 1
#endif
#define NumEncodersMax KM0_ENCODER_SCANNER__NUM_ENCODERS_MAX

static const int rot_none = 2;
static const int rot_ccw = 0;
static const int rot_cw = 1;

typedef struct {
  int prev_a;
  uint32_t rots_buf;
  int rots_num;
} EncoderState;

static int numEncoders = 0;
static EncoderConfig *encoderConfigs;
static EncoderState encoderStates[NumEncodersMax];

static void encoderInstance_decodeInputOnPhaseAEdge(EncoderConfig *config, EncoderState *state) {
  int a = digitalIo_read(config->pinA);
  if (a != state->prev_a) {
    int b = digitalIo_read(config->pinB);
    int delta = rot_none;
    if (!state->prev_a && a) {
      delta = (b == 0) ? rot_cw : rot_ccw;
    }
    if (state->prev_a && !a) {
      delta = (b == 1) ? rot_cw : rot_ccw;
    }
    if (delta != rot_none) {
      bit_spec(state->rots_buf, state->rots_num, delta);
      state->rots_num++;
    }
    state->prev_a = a;
  }
}

static int encoderInstance_pullRotationEventOne(EncoderState *state) {
  if (state->rots_num > 0) {
    int rot = state->rots_buf & 1;
    state->rots_buf >>= 1;
    state->rots_num--;
    return rot == rot_cw ? 1 : -1;
  }
  return 0;
}

ISR(PCINT0_vect) {
  for (int i = 0; i < numEncoders; i++) {
    EncoderConfig *config = &encoderConfigs[i];
    EncoderState *state = &encoderStates[i];
    encoderInstance_decodeInputOnPhaseAEdge(config, state);
  }
}

void keyScanner_encoderBasic_initialize(uint8_t num, EncoderConfig *_encoderConfigs) {
  numEncoders = num;
  encoderConfigs = _encoderConfigs;

  uint8_t pcmsk = 0;
  for (int i = 0; i < numEncoders; i++) {
    EncoderConfig *config = &encoderConfigs[i];
    if (!(P_B0 <= config->pinA && config->pinA <= P_B7)) {
      //pinA must be one of B0~B7 (which belongs to PCINT)
      continue;
    }
    digitalIo_setInputPullup(config->pinA);
    digitalIo_setInputPullup(config->pinB);
    uint8_t portBit = config->pinA & 7;
    pcmsk = 1 << portBit;
  }
  PCICR |= _BV(PCIE0);
  PCMSK0 = pcmsk;
}

void keyScanner_encoderBasic_update(uint8_t *keyStateBitFlags) {
  for (int i = 0; i < numEncoders; i++) {
    EncoderConfig *config = &encoderConfigs[i];
    EncoderState *state = &encoderStates[i];
    int dir = encoderInstance_pullRotationEventOne(state);
    utils_writeArrayedBitFlagsBit(keyStateBitFlags, config->scanIndexBase + 0, dir == -1);
    utils_writeArrayedBitFlagsBit(keyStateBitFlags, config->scanIndexBase + 1, dir == 1);
  }
}
