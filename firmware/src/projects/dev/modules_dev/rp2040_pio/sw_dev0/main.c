
#include <stdio.h>
#include <stdlib.h>

#include "dio.h"
#include "hardware/clocks.h"
#include "pico/stdlib.h"
#include "swtxrx.pio.h"

//const float SwClockDiv = 1000000;

const float SwClockDiv = 125; //1MHz
// const float SwClockDiv = 1250; //100kHz
// const float SwClockDiv = 12500; //10kHz
// const float SwClockDiv = 125000; //1kHz

static inline void swtx_program_init(PIO pio, uint sm, uint offset, uint pin) {
  //sender pseudo open drain
  gpio_pull_up(pin);
  pio_gpio_init(pio, pin);
  pio_sm_set_consecutive_pindirs(pio, sm, pin, 1, false);
  // gpio_set_oeover(pin, GPIO_OVERRIDE_INVERT);

  pio_sm_config c = swtx_program_get_default_config(offset);
  sm_config_set_set_pins(&c, pin, 1);
  sm_config_set_out_shift(&c, true, false, 0);
  sm_config_set_clkdiv(&c, SwClockDiv);
  pio_sm_init(pio, sm, offset, &c);

  pio_sm_set_enabled(pio, sm, true);
}

static inline void swrx_program_init(PIO pio, uint sm, uint offset, uint pin, uint pin_sideset) {
  //receiver pin pseudo open drain
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

//------------------------------------

const int PIN_LED = 25;

void initLed() {
  dio_setOutput(PIN_LED);
}

void tick_blink() {
  dio_toggle(PIN_LED);
}

//------------------------------------

static uint16_t decodeReceivedWord(uint32_t val) {
  uint8_t flag = val >> 31 & 1;
  uint8_t byte = val >> 23 % 0xFF;
  return flag << 8 | byte;
}

void dumpShortWords(uint16_t *words, uint len) {
  for (int i = 0; i < len; i++) {
    printf("%x", words[i]);
    if (i < len - 1) {
      printf(",");
    }
  }
  printf("\n");
}

//------------------------------------

void txout_send_sync_single_word(PIO pio, uint sm, uint word) {
  pio_sm_put_blocking(pio, sm, word); //TX FIFOにデータをpush
  //RX FIFOに送信完了通知用の空データが来るのを待つ
  while (pio_sm_is_rx_fifo_empty(pio, sm)) {
    tight_loop_contents();
  }
  int data = pio->rxf[sm]; //読み捨て
  // sleep_us(1);
}

static inline uint16_t rxin_wait_receive_single_word(PIO pio, uint sm) {
  //ポーリングでデータが来るまで待つ
  while (pio_sm_is_rx_fifo_empty(pio, sm)) {
    tight_loop_contents();
  }
  return decodeReceivedWord(pio->rxf[sm]);
}

int rxin_receive_words(PIO pio, uint sm, uint16_t *rcv_buffer, int maxLen) {
  int pos = 0;
  while (pos < maxLen) {
    uint16_t val = rxin_wait_receive_single_word(pio, sm);
    rcv_buffer[pos++] = val;
    if ((val >> 8) & 1 > 0) {
      //終端フラグ検知
      return pos;
    }
  }
  return -1;
}

//------------------------------------

//master uses PIO0(sm0 for tx, sm1 for rx)
const PIO pio_sw1 = pio0;
const int sm_tx1 = 0;
const int sm_rx1 = 1;

//slave uses PIO1(sm0 for tx, sm1 for rx)
const PIO pio_sw2 = pio1;
const int sm_tx2 = 0;
const int sm_rx2 = 1;

const int PIN_MASTER = 20;
const int PIN_MASTER_RCV_SIDESET = 21;

const int PIN_SLAVE = 26;
const int PIN_SLAVE_RCV_SIDESET = 27;

uint16_t rcvbuf1[8];
uint16_t rcvbuf2[8];

//------------------------------------
//master sender

void setup_txout1() {
  uint offset = pio_add_program(pio_sw1, &swtx_program);
  swtx_program_init(pio_sw1, sm_tx1, offset, PIN_MASTER);
}

void tick_txout1() {
  pio_sm_set_enabled(pio_sw1, sm_rx1, false); //受信を無効化

  txout_send_sync_single_word(pio_sw1, sm_tx1, 0x12);
  txout_send_sync_single_word(pio_sw1, sm_tx1, 0x34);
  txout_send_sync_single_word(pio_sw1, sm_tx1, 0x156);

  pio_sm_set_enabled(pio_sw1, sm_rx1, true); //受信を有効化
}

//------------------------------------
//master receiver

void setup_rxin1() {
  uint offset = pio_add_program(pio_sw1, &swrx_program);
  swrx_program_init(pio_sw1, sm_rx1, offset, PIN_MASTER, PIN_MASTER_RCV_SIDESET);
}

uint rcvsz1 = 0;
void tick_rxin1() {
  rcvsz1 = rxin_receive_words(pio_sw1, sm_rx1, rcvbuf1, 8);
}

void dump_received_rxin1() {
  printf("rcv@master: ");
  dumpShortWords(rcvbuf1, rcvsz1);
}

//------------------------------------
//slave sender

void setup_txout2() {
  uint offset = pio_add_program(pio_sw2, &swtx_program);
  swtx_program_init(pio_sw2, sm_tx2, offset, PIN_SLAVE);
}

void tick_txout2() {
  pio_sm_set_enabled(pio_sw2, sm_rx2, false);
  txout_send_sync_single_word(pio_sw2, sm_tx2, 0xAB);
  txout_send_sync_single_word(pio_sw2, sm_tx2, 0xCD);
  txout_send_sync_single_word(pio_sw2, sm_tx2, 0x1EF);
  pio_sm_set_enabled(pio_sw2, sm_rx2, true);
}

//------------------------------------
//slave receiver

void setup_rxin2() {
  uint offset = pio_add_program(pio_sw2, &swrx_program);
  swrx_program_init(pio_sw2, sm_rx2, offset, PIN_SLAVE, PIN_SLAVE_RCV_SIDESET);
}

uint rcvsz2 = 0;

void tick_rxin2() {
  rcvsz2 = rxin_receive_words(pio_sw2, sm_rx2, rcvbuf2, 8);
}

void dump_received_rxin2() {
  printf("rcv@slave: ");
  dumpShortWords(rcvbuf2, rcvsz2);
}

//------------------------------------

int main() {
  stdio_init_all();
  initLed();
  printf("start\n");

  //master
  setup_txout1();
  setup_rxin1();
  //salve
  setup_rxin2();
  setup_txout2();

  printf("sm initialize done\n");

  while (1) {
    tick_blink();
    tick_txout1();
    tick_rxin2();
    tick_txout2();
    tick_rxin1();
    dump_received_rxin2();
    dump_received_rxin1();
    sleep_ms(1000);
  }
}
