#include "hardware/clocks.h"
#include "hardware/pio.h"
#include "km0/deviceIo/boardIo.h"
#include "km0/deviceIo/digitalIo.h"
#include "km0/deviceIo/system.h"
#include "neoPixelCore.pio.h"

static void neoPixelCoreDev_initProgram(PIO pio, uint sm, uint offset, uint pin) {
  pio_gpio_init(pio, pin);
  pio_sm_set_consecutive_pindirs(pio, sm, pin, 1, true);

  pio_sm_config c = neopixel_emitter_program_get_default_config(offset);
  sm_config_set_sideset_pins(&c, pin);
  sm_config_set_out_shift(&c, false, false, 0);
  sm_config_set_fifo_join(&c, PIO_FIFO_JOIN_TX);
  int ns_per_cycle = 150;
  float freq = 1000000000 / ns_per_cycle;
  float div = clock_get_hz(clk_sys) / freq;
  sm_config_set_clkdiv(&c, div);

  pio_sm_init(pio, sm, offset, &c);
  pio_sm_set_enabled(pio, sm, true);
}

void neoPixelCoreDev_putPixel(PIO pio, int sm, uint32_t pixel_rrggbb) {
  uint8_t rr = pixel_rrggbb >> 16 & 0xFF;
  uint8_t gg = pixel_rrggbb >> 8 & 0xFF;
  uint8_t bb = pixel_rrggbb & 0xFF;
  uint32_t data =
      ((uint32_t)(gg) << 24) |
      ((uint32_t)(rr) << 16) |
      ((uint32_t)(bb) << 8);
  pio_sm_put_blocking(pio, sm, data);
}

void neoPixelCoreDev_initialize(PIO pio, int sm, uint pin) {
  uint offset = pio_add_program(pio, &neopixel_emitter_program);
  neoPixelCoreDev_initProgram(pio, sm, offset, pin);
  neoPixelCoreDev_putPixel(pio, sm, 0);
}

//----------
const PIO serial_led_pio = pio1;
const int serial_led_sm = 1;

void serialLedDev_putPixelWithAlpha(uint32_t pixel_aarrggbb) {
  uint8_t aa = pixel_aarrggbb >> 24 & 0xFF;
  uint8_t rr = ((pixel_aarrggbb >> 16 & 0xFF) * aa) >> 8;
  uint8_t gg = ((pixel_aarrggbb >> 8 & 0xFF) * aa) >> 8;
  uint8_t bb = ((pixel_aarrggbb & 0xFF) * aa) >> 8;
  uint32_t pixel_rrggbb = (uint32_t)rr << 16 | (uint32_t)gg << 8 | (uint32_t)bb;
  neoPixelCoreDev_putPixel(serial_led_pio, serial_led_sm, pixel_rrggbb);
}

void serialLedDev_initialize(uint pin) {
  neoPixelCoreDev_initialize(serial_led_pio, serial_led_sm, pin);
}

//----------

uint32_t colors[] = { 0xFF0000, 0x00FF00, 0x0000FF, 0x00FFFF, 0xFF00FF, 0xFFFF00 };

void main() {
  boardIo_setupLeds_rpiPico();
  serialLedDev_initialize(GP2);

  int cnt = 0;
  while (1) {
    uint termMs = 2000;
    float p = (cnt % termMs) / (float)termMs;
    float q = p < 0.5 ? 2 * p : (2 - 2 * p);
    uint32_t alpha = q * 20;
    for (int i = 0; i < 6; i++) {
      uint32_t col = (alpha << 24) | colors[i];
      serialLedDev_putPixelWithAlpha(col);
    }
    delayMs(1);
    cnt++;
  }
}