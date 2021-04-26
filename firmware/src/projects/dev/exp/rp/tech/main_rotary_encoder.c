#include "km0/common/bitOperations.h"
#include "km0/deviceIo/debugUart.h"
#include "km0/deviceIo/dio.h"
#include "km0/deviceIo/system.h"
#include <stdio.h>

#define NumEncodersMax 4
typedef struct {
  uint8_t pin1;
  uint8_t pin2;
  uint8_t scanIndexBase;
} EncoderConfig;

typedef struct {
  uint8_t bin : 2;
  int8_t dir : 2;
  bool holdA : 1;
  bool holdB : 1;
} EncoderState;

static int numEncoders = 0;
static EncoderConfig *encoderConfigs;
static EncoderState encoderStates[NumEncodersMax];

void keyScanner_rotaryEncoders_initialize(uint8_t num, EncoderConfig *_encoderConfigs) {
  numEncoders = num;
  encoderConfigs = _encoderConfigs;
  for (int i = 0; i < numEncoders; i++) {
    EncoderConfig *config = &encoderConfigs[i];
    dio_setInputPullup(config->pin1);
    dio_setInputPullup(config->pin2);
  }
}

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

void keyScanner_rotaryEncoders_update(uint8_t *keyStateBitFlags) {
  for (int i = 0; i < numEncoders; i++) {
    EncoderConfig *config = &encoderConfigs[i];
    EncoderState *state = &encoderStates[i];
    updateEncoderInstance(config, state);
    bit_spec(keyStateBitFlags[0], config->scanIndexBase + 0, state->holdA);
    bit_spec(keyStateBitFlags[0], config->scanIndexBase + 1, state->holdB);
  }
}

//---------------------------------------------

static EncoderConfig appEncoderConfigs[] = {
  { .pin1 = GP16, .pin2 = GP17, .scanIndexBase = 0 },
  { .pin1 = GP18, .pin2 = GP19, .scanIndexBase = 2 },
};

static uint8_t keyStateBitFlags[1] = { 0 };

int main() {
  debugUart_setup(115200);
  printf("start\n");

  dio_setOutput(GP25);
  keyScanner_rotaryEncoders_initialize(2, appEncoderConfigs);

  int cnt = 0;
  while (true) {
    if (cnt % 4 == 0) {
      keyScanner_rotaryEncoders_update(keyStateBitFlags);
      for (int i = 0; i < 4; i++) {
        if (bit_read(keyStateBitFlags[0], i)) {
          dio_toggle(GP25);
          printf("encoder stepped %d\n", i);
        }
      }
    }
    if (cnt % 1000 == 0) {
      dio_toggle(GP25);
    }
    cnt++;
    delayMs(1);
  }
}
