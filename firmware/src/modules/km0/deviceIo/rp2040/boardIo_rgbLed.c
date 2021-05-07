#include "km0/deviceIo/boardIo.h"
#include "neoPixelCore.h"

#ifndef KM0_RP_BOARD_IO_RGBLED__PIO_INSTANCE
#define KM0_RP_BOARD_IO_RGBLED__PIO_INSTANCE pio0
#endif

#ifndef KM0_RP_BOARD_IO_RGBLED__PIO_SM
#define KM0_RP_BOARD_IO_RGBLED__PIO_SM 0
#endif

static const uint8_t brightness_b = 60;
static const uint8_t brightness_g = 15;

static const PIO pio_rgbled = KM0_RP_BOARD_IO_RGBLED__PIO_INSTANCE;
static const int sm_rgbled = KM0_RP_BOARD_IO_RGBLED__PIO_SM;

static bool state_led1 = false;
static bool state_led2 = false;

void boardIo_setupLedsRgb(int8_t pin) {
  neoPixelCore_initialize(pio_rgbled, sm_rgbled, pin);
}

static inline uint32_t pixelARGB(uint8_t a, uint8_t r, uint8_t g, uint8_t b) {
  return (uint32_t)(a) << 24 | (uint32_t)(r) << 16 | ((uint32_t)(g) << 8) | (uint32_t)(b);
}

static void updateLedColor() {
  uint8_t rr = 0;
  uint8_t gg = state_led1 ? brightness_g : 0;
  uint8_t bb = state_led2 ? brightness_b : 0;
  uint32_t color = pixelARGB(0xFF, rr, gg, bb);
  neoPixelCore_putPixel(pio_rgbled, sm_rgbled, color);
}

void boardIo_writeLed1(bool val) {
  state_led1 = val;
  updateLedColor();
}

void boardIo_writeLed2(bool val) {
  state_led2 = val;
  updateLedColor();
}

void boardIo_setupLeds_proMicroRp() {
  boardIo_setupLedsRgb(25);
}
