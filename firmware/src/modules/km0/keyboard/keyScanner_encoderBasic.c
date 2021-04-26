#include "keyScanner_encoderBasic.h"
#include "km0/common/bitOperations.h"
#include "km0/common/utils.h"
#include "km0/deviceIo/dio.h"
#if __has_include("config.h")
#include "config.h"
#endif

#ifndef KM0_ENCODER_SCANNER__NUM_ENCODERS_MAX
#define KM0_ENCODER_SCANNER__NUM_ENCODERS_MAX 4
#endif

#define NumEncodersMax KM0_ENCODER_SCANNER__NUM_ENCODERS_MAX

typedef struct {
  uint8_t bin : 2;
  int8_t dir : 2;
  bool holdA : 1;
  bool holdB : 1;
} EncoderState;

static int numEncoders = 0;
static EncoderConfig *encoderConfigs;
static EncoderState encoderStates[NumEncodersMax];

static const int err = 2;

static const int encoder_count_delta_table[16] = {
  0, -1, 1, err, 1, 0, err, -1, -1, err, 0, 1, err, 1, -1, 0
};

static void updateEncoderInstance(EncoderConfig *config, EncoderState *state) {

  int a = dio_read(config->pin1) == 0 ? 1 : 0;
  int b = dio_read(config->pin2) == 0 ? 1 : 0;

  int prev_bin = state->bin;
  state->bin = ((a << 1) | b) & 0b11;

  int table_index = ((prev_bin << 2) | state->bin) & 0x0F;
  int delta = encoder_count_delta_table[table_index];

  if (delta == err) {
    // delta = (dir)*2;
    delta = state->dir;
    // delta = 0;
  } else {
    state->dir = delta;
  }

  state->holdA = delta == -1;
  state->holdB = delta == 1;
}

void keyScanner_encoderBasic_initialize(uint8_t num, EncoderConfig *_encoderConfigs) {
  numEncoders = num;
  encoderConfigs = _encoderConfigs;
  for (int i = 0; i < numEncoders; i++) {
    EncoderConfig *config = &encoderConfigs[i];
    dio_setInputPullup(config->pin1);
    dio_setInputPullup(config->pin2);
  }
}

void keyScanner_encoderBasic_update(uint8_t *keyStateBitFlags) {
  for (int i = 0; i < numEncoders; i++) {
    EncoderConfig *config = &encoderConfigs[i];
    EncoderState *state = &encoderStates[i];
    updateEncoderInstance(config, state);
    utils_writeArrayedBitFlagsBit(keyStateBitFlags, config->scanIndexBase + 0, state->holdA);
    utils_writeArrayedBitFlagsBit(keyStateBitFlags, config->scanIndexBase + 1, state->holdB);
  }
}