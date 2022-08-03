#include "km0/device/boardIo.h"
#include "km0/device/boardIoImpl.h"
#include "neoPixelCore.h"
#include "pico_sdk/src/common/include/pico/stdlib.h"

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

static bool led_states[2] = { false, false };

static inline uint32_t pixelRGB(uint8_t r, uint8_t g, uint8_t b) {
  return (uint32_t)(r) << 16 | ((uint32_t)(g) << 8) | (uint32_t)(b);
}

static void updateLedColor() {
  uint8_t rr = 0;
  uint8_t gg = led_states[0] ? brightness_g : 0;
  uint8_t bb = led_states[1] ? brightness_b : 0;
  uint32_t color = pixelRGB(rr, gg, bb);
  neoPixelCore_putPixel(pio_rgbled, sm_rgbled, color);
}

static void handleBoardLedOperation(int index, int op) {
  if (op != LedOp_Toggle) {
    bool value = op == LedOp_TurnOn;
    led_states[index] = value;
  } else {
    led_states[index] = !led_states[index];
  }
  updateLedColor();
}

void boardIoImpl_setupLedsRgb(int8_t pin_led, int8_t pin_led_power) {
  neoPixelCore_initialize(pio_rgbled, sm_rgbled, pin_led);
  if (pin_led_power != -1) {
    gpio_init(pin_led_power);
    gpio_set_dir(pin_led_power, GPIO_OUT);
    gpio_put(pin_led_power, 1);
  }
  boardIo_internal_setLedFunction(handleBoardLedOperation);
}

void boardIoImpl_setupLeds_proMicroRp() {
  boardIoImpl_setupLedsRgb(25, -1);
}

void boardIoImpl_setupLeds_qtPyRp() {
  boardIoImpl_setupLedsRgb(12, 11);
}
