#include "neoPixelCore.pio.h"
#include "pico_sdk/src/rp2_common/include/hardware/clocks.h"
#include "pico_sdk/src/rp2_common/include/hardware/pio.h"

static void neoPixelCore_initProgram(PIO pio, uint sm, uint offset, uint pin) {
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

void neoPixelCore_putPixel(PIO pio, int sm, uint32_t pixel_rrggbb) {
  uint8_t rr = pixel_rrggbb >> 16 & 0xFF;
  uint8_t gg = pixel_rrggbb >> 8 & 0xFF;
  uint8_t bb = pixel_rrggbb & 0xFF;
  uint32_t data =
      ((uint32_t)(gg) << 24) |
      ((uint32_t)(rr) << 16) |
      ((uint32_t)(bb) << 8);
  pio_sm_put_blocking(pio, sm, data);
}

void neoPixelCore_initialize(PIO pio, int sm, uint pin) {
  uint offset = pio_add_program(pio, &neopixel_emitter_program);
  neoPixelCore_initProgram(pio, sm, offset, pin);
  neoPixelCore_putPixel(pio, sm, 0);
}
