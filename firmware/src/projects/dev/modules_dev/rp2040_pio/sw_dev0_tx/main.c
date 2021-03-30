
#include <stdio.h>
#include <stdlib.h>

#include "dio.h"
#include "hardware/clocks.h"
#include "pico/stdlib.h"
#include "swtx.pio.h"

static inline void swtx_program_init(PIO pio, uint sm, uint offset, uint pin) {
  pio_gpio_init(pio, pin);
  pio_sm_set_consecutive_pindirs(pio, sm, pin, 1, true);
  pio_sm_config c = swtx_program_get_default_config(offset);
  sm_config_set_sideset_pins(&c, pin);
  sm_config_set_out_shift(&c, true, false, 0);
  // sm_config_set_fifo_join(&c, PIO_FIFO_JOIN_TX);
  sm_config_set_clkdiv(&c, 1000000);

  pio_sm_init(pio, sm, offset, &c);
  pio_sm_set_enabled(pio, sm, true);
}

const int PIN_LED = 25;
const int PIN_TX = 20;

void initLed() {
  dio_setOutput(PIN_LED);
}

void tick_blink() {
  dio_toggle(PIN_LED);
}

void tick_txout() {
  pio_sm_put_blocking(pio0, 0, 0xC4);
  sleep_ms(15);
  pio_sm_put_blocking(pio0, 0, 0x1A7);
}

int main() {
  stdio_init_all();
  initLed();

  PIO pio = pio0;
  int sm = 0;
  uint offset = pio_add_program(pio, &swtx_program);
  swtx_program_init(pio, sm, offset, PIN_TX);

  while (1) {
    tick_blink();
    tick_txout();
    sleep_ms(1000);
  }
}
