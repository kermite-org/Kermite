#include "boardLED.h"
#include "hardware/clocks.h"
#include "hardware/pio.h"

#ifndef BOARD_LED_RGB_RP2040_PIO
#define BOARD_LED_RGB_RP2040_PIO pio0
#endif

#ifndef BOARD_LED_RGB_RP2040_SM
#define BOARD_LED_RGB_RP2040_SM 0
#endif

//based on
//https://github.com/raspberrypi/pico-examples/blob/master/pio/ws2812/ws2812.c

#define ws2812_wrap_target 0
#define ws2812_wrap 3

#define ws2812_T1 2
#define ws2812_T2 5
#define ws2812_T3 3

static const uint16_t ws2812_program_instructions[] = {
  //     .wrap_target
  0x6221, //  0: out    x, 1            side 0 [2]
  0x1123, //  1: jmp    !x, 3           side 1 [1]
  0x1400, //  2: jmp    0               side 1 [4]
  0xa442, //  3: nop                    side 0 [4]
  //     .wrap
};
static const struct pio_program ws2812_program = {
  .instructions = ws2812_program_instructions,
  .length = 4,
  .origin = -1,
};

static inline pio_sm_config ws2812_program_get_default_config(uint offset) {
  pio_sm_config c = pio_get_default_sm_config();
  sm_config_set_wrap(&c, offset + ws2812_wrap_target, offset + ws2812_wrap);
  sm_config_set_sideset(&c, 1, false, false);
  return c;
}

static inline void ws2812_program_init(PIO pio, uint sm, uint offset, uint pin, float freq, bool rgbw) {
  pio_gpio_init(pio, pin);
  pio_sm_set_consecutive_pindirs(pio, sm, pin, 1, true);
  pio_sm_config c = ws2812_program_get_default_config(offset);
  sm_config_set_sideset_pins(&c, pin);
  sm_config_set_out_shift(&c, false, true, rgbw ? 32 : 24);
  sm_config_set_fifo_join(&c, PIO_FIFO_JOIN_TX);
  int cycles_per_bit = ws2812_T1 + ws2812_T2 + ws2812_T3;
  float div = clock_get_hz(clk_sys) / (freq * cycles_per_bit);
  sm_config_set_clkdiv(&c, div);
  pio_sm_init(pio, sm, offset, &c);
  pio_sm_set_enabled(pio, sm, true);
}

static inline void put_pixel(uint32_t pixel_grb) {
  pio_sm_put_blocking(pio0, 0, pixel_grb << 8u);
}

static inline uint32_t urgb_u32(uint8_t r, uint8_t g, uint8_t b) {
  return ((uint32_t)(r) << 8) |
         ((uint32_t)(g) << 16) |
         (uint32_t)(b);
}

void boardLED_initLEDs(int8_t pin1, int8_t pin2, bool invert) {}

void boardLED_initRgbLED(int8_t pin_tx) {
  // todo get free sm
  PIO pio = BOARD_LED_RGB_RP2040_PIO;
  int sm = BOARD_LED_RGB_RP2040_SM;
  uint offset = pio_add_program(pio, &ws2812_program);
  ws2812_program_init(pio, sm, offset, pin_tx, 800000, true);
  put_pixel(0);
}

static uint8_t value_r = 0;
static uint8_t value_g = 0;
static uint8_t value_b = 0;

static void updateLEDColor() {
  put_pixel(urgb_u32(value_r, value_g, value_b));
}

static const uint8_t brightness_b = 60;
static const uint8_t brightness_g = 15;

void boardLED_outputLED1(bool val) {
  value_g = val ? brightness_g : 0;
  updateLEDColor();
}

void boardLED_outputLED2(bool val) {
  value_b = val ? brightness_b : 0;
  updateLEDColor();
}
