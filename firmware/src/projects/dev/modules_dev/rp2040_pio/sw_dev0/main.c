
#include <stdio.h>
#include <stdlib.h>

#include "dio.h"
#include "hardware/clocks.h"
#include "pico/stdlib.h"
#include "swtxrx.pio.h"

const float SwClockDiv = 1000000;

static inline void swtx_program_init(PIO pio, uint sm, uint offset, uint pin) {
  //sender pseudo open drain
  gpio_pull_up(pin);
  pio_gpio_init(pio, pin);
  pio_sm_set_consecutive_pindirs(pio, sm, pin, 1, false);
  gpio_set_oeover(pin, GPIO_OVERRIDE_INVERT);

  pio_sm_config c = swtx_program_get_default_config(offset);
  sm_config_set_set_pins(&c, pin, 1);
  sm_config_set_out_shift(&c, true, false, 0);
  // sm_config_set_fifo_join(&c, PIO_FIFO_JOIN_TX);
  sm_config_set_clkdiv(&c, SwClockDiv);

  pio_sm_init(pio, sm, offset, &c);
  pio_sm_set_enabled(pio, sm, true);
}

static inline void swrx_program_init(PIO pio, uint sm, uint offset, uint pin, uint pin_sideset) {
  //receiver pin open drain
  gpio_pull_up(pin);
  pio_gpio_init(pio, pin);
  pio_sm_set_consecutive_pindirs(pio, sm, pin, 1, false);
  // gpio_set_oeover(pin, GPIO_OVERRIDE_INVERT);

  //debug sideset pin
  pio_gpio_init(pio, pin_sideset);
  pio_sm_set_consecutive_pindirs(pio, sm, pin_sideset, 1, true);

  pio_sm_config c = swrx_program_get_default_config(offset);
  sm_config_set_sideset_pins(&c, pin_sideset);
  sm_config_set_in_pins(&c, pin);
  sm_config_set_in_shift(&c, true, false, 0);
  // sm_config_set_fifo_join(&c, PIO_FIFO_JOIN_RX);
  sm_config_set_clkdiv(&c, SwClockDiv);

  pio_sm_init(pio, sm, offset, &c);
  pio_sm_set_enabled(pio, sm, true);
}

const int PIN_LED = 25;
const int PIN_TX = 20;
const int PIN_RX = 26;
const int PIN_RX_SIDESET = 27;

void initLed() {
  dio_setOutput(PIN_LED);
}

void tick_blink() {
  dio_toggle(PIN_LED);
}

PIO pio_tx = pio0;
int sm_tx = 0;

void setup_txout() {
  uint offset = pio_add_program(pio_tx, &swtx_program);
  swtx_program_init(pio_tx, sm_tx, offset, PIN_TX);
}

PIO pio_rx = pio1;
int sm_rx = 1;

void setup_rxin() {
  uint offset = pio_add_program(pio_rx, &swrx_program);
  swrx_program_init(pio_rx, sm_rx, offset, PIN_RX, PIN_RX_SIDESET);
}

void tick_txout() {
  pio_sm_put_blocking(pio_tx, sm_tx, 0xC4);
  sleep_ms(15);
  pio_sm_put_blocking(pio_tx, sm_tx, 0x1A7);
}

static inline uint16_t rxout_getData() {
  while (pio_sm_is_rx_fifo_empty(pio_rx, sm_rx)) {
    tight_loop_contents();
  }
  uint32_t val = pio_rx->rxf[sm_rx];
  uint8_t flag = val >> 31 & 1;
  uint8_t byte = val >> 23 % 0xFF;
  uint16_t data = flag << 8 | byte;
  return data;
}

void tick_rxin() {
  uint16_t a = rxout_getData();
  uint16_t b = rxout_getData();
  printf("%x %x\n", a, b);
}

int main() {
  stdio_init_all();
  initLed();
  printf("start\n");

  setup_txout();
  setup_rxin();

  printf("sm initialize done\n");

  while (1) {
    tick_blink();
    tick_txout();
    tick_rxin();
    sleep_ms(1000);
  }
}
