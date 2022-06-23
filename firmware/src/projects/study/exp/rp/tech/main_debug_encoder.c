#include "km0/base/utils.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/device/system.h"
#include <stdio.h>

typedef struct {
  uint8_t pin1;
  uint8_t pin2;
  uint8_t scanIndexBase;
} EncoderConfig;

typedef struct {
  uint8_t bin : 2;
  // int8_t dir : 2;
  bool holdA : 1;
  bool holdB : 1;
} EncoderState;

static const int err = 2;

static const uint8_t encoder_count_delta_table[16] = {
  0, 1, -1, err,
  -1, 0, err, 1,
  1, err, 0, -1,
  err, -1, 1, 0
};

void initEncoderInstance(EncoderConfig *config) {
  digitalIo_setInputPullup(config->pin1);
  digitalIo_setInputPullup(config->pin2);
}

static void updateEncoderInstance(EncoderConfig *config, EncoderState *state) {

  digitalIo_toggle(GP16);

  int a = digitalIo_read(config->pin1) == 0 ? 1 : 0;
  int b = digitalIo_read(config->pin2) == 0 ? 1 : 0;

  int prev_bin = state->bin;
  int bin = ((b << 1) | a);

  int delta = 0;
  if (0) {
    int table_index = (prev_bin << 2) | bin;
    delta = encoder_count_delta_table[table_index];
  } else {
    int prev_a = prev_bin & 1;
    if (!prev_a && a) {
      delta = b ? -1 : 1;
    }
  }

  state->bin = bin;
  state->holdA = delta == -1;
  state->holdB = delta == 1;

  if (state->holdA || state->holdB) {
    printf("sa:%d, sb:%d\n", state->holdA, state->holdB);
  }
}

EncoderConfig encoderConfig = {
  .pin1 = GP21, .pin2 = GP20, .scanIndexBase = 0
};

EncoderState encoderState;

uint8_t scanBuf[1];

void main() {
  debugUart_initialize(115200);
  boardIo_setupLeds_rpiPico();

  digitalIo_setOutput(GP16);

  digitalIo_setOutput(GP19);
  digitalIo_setOutput(GP18);

  initEncoderInstance(&encoderConfig);
  uint32_t cnt = 0;
  while (1) {
    if (cnt % 1000 == 0) {
      boardIo_toggleLed1();
    }
    updateEncoderInstance(&encoderConfig, &encoderState);

    digitalIo_write(GP19, encoderState.holdA);
    digitalIo_write(GP18, encoderState.holdB);
    cnt++;
    delayMs(1);
  }
}