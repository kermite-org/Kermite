#include "keyScanner_encoders.h"
#include "km0/base/bitOperations.h"
#include "km0/base/configImport.h"
#include "km0/base/utils.h"
#include "km0/device/digitalIo.h"
#include <stdio.h>

#ifndef KM0_ENCODER_SCANNER__NUM_ENCODERS_MAX
#define KM0_ENCODER_SCANNER__NUM_ENCODERS_MAX 4
#endif

#ifdef KM0_ENCODER_SCANNER__USE_FULL_STEP_DECODER
static const bool useFullStepDecoder = true;
#else
static const bool useFullStepDecoder = false;
#endif

#define NumEncodersMax KM0_ENCODER_SCANNER__NUM_ENCODERS_MAX

typedef struct {
  uint8_t bin : 2;
  bool holdA : 1;
  bool holdB : 1;
} EncoderState;

static int numEncoders = 0;
static EncoderConfig *encoderConfigs;
static EncoderState encoderStates[NumEncodersMax];

static const int err = 2;

static const int8_t encoder_count_delta_table[16] = {
  0, 1, -1, err,
  -1, 0, err, 1,
  1, err, 0, -1,
  err, -1, 1, 0
};

static void updateEncoderInstance(EncoderConfig *config, EncoderState *state) {

  int a = digitalIo_read(config->pinA) == 0 ? 1 : 0;
  int b = digitalIo_read(config->pinB) == 0 ? 1 : 0;
  int delta = 0;
  int prev_bin = state->bin;
  int bin = ((b << 1) | a);

  if (useFullStepDecoder) {
    //ノンクリックタイプのエンコーダ
    int table_index = (prev_bin << 2) | bin;
    delta = encoder_count_delta_table[table_index];
  } else {
    //クリックタイプのエンコーダ, クリック安定点でB相の出力が不定のものの対応
    //EC12E2420801
    //A相の立ち上がりでB相を見て回転方向を判定する
    int prev_a = prev_bin & 1;
    if (!prev_a && a) {
      delta = b ? -1 : 1;
    }
  }

  state->bin = bin;
  state->holdA = delta == -1;
  state->holdB = delta == 1;
}

void keyScanner_encoders_initialize(uint8_t num, EncoderConfig *_encoderConfigs) {
  numEncoders = num;
  encoderConfigs = _encoderConfigs;
  for (int i = 0; i < numEncoders; i++) {
    EncoderConfig *config = &encoderConfigs[i];
    digitalIo_setInputPullup(config->pinA);
    digitalIo_setInputPullup(config->pinB);
  }
}

void keyScanner_encoders_update(uint8_t *keyStateBitFlags) {
  for (int i = 0; i < numEncoders; i++) {
    EncoderConfig *config = &encoderConfigs[i];
    EncoderState *state = &encoderStates[i];
    updateEncoderInstance(config, state);
    utils_writeArrayedBitFlagsBit(keyStateBitFlags, config->scanIndexBase + 0, state->holdA);
    utils_writeArrayedBitFlagsBit(keyStateBitFlags, config->scanIndexBase + 1, state->holdB);
  }
}