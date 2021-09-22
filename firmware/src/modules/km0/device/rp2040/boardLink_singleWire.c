
#include "km0/base/configImport.h"
#include "km0/base/utils.h"
#include "km0/device/boardLink.h"
#include "km0/device/digitalIo.h"
#include "pico_sdk/src/common/include/pico/stdlib.h"
#include "pico_sdk/src/rp2_common/include/hardware/clocks.h"
#include "pico_sdk/src/rp2_common/include/pico/multicore.h"
#include "singleWire4.pio.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

//------------------------------------------------------------
//program initializers

static void swtx_program_init(PIO pio, uint sm, uint offset, float freq, int pin) {
  //sender pseudo open drain
  gpio_pull_up(pin);
  pio_gpio_init(pio, pin);
  pio_sm_set_consecutive_pindirs(pio, sm, pin, 1, false);

  pio_sm_config c = prog_singlewire_tx_program_get_default_config(offset);
  sm_config_set_set_pins(&c, pin, 1);
  sm_config_set_out_shift(&c, true, false, 0);

  float clkdiv = clock_get_hz(clk_sys) / freq;
  sm_config_set_clkdiv(&c, clkdiv);
  pio_sm_init(pio, sm, offset, &c);

  pio_sm_set_enabled(pio, sm, true);
}

static void swrx_program_init(PIO pio, uint sm, uint offset, float freq, int pin, int pin_sideset) {
  //receiver pin pseudo open drain
  gpio_pull_up(pin);
  pio_gpio_init(pio, pin);
  pio_sm_set_consecutive_pindirs(pio, sm, pin, 1, false);

  if (pin_sideset != -1) {
    //debug sideset pin
    pio_gpio_init(pio, pin_sideset);
    pio_sm_set_consecutive_pindirs(pio, sm, pin_sideset, 1, true);
  }

  pio_sm_config c = prog_singlewire_rx_program_get_default_config(offset);
  if (pin_sideset != -1) {
    sm_config_set_sideset_pins(&c, pin_sideset);
  }
  sm_config_set_in_pins(&c, pin);
  sm_config_set_in_shift(&c, true, false, 0);

  float clkdiv = clock_get_hz(clk_sys) / freq;
  sm_config_set_clkdiv(&c, clkdiv);

  pio_sm_init(pio, sm, offset, &c);
  pio_sm_set_enabled(pio, sm, true);
}
//------------------------------------------------------------
//frame sender

static void txout_send_sync_single_word(PIO pio, uint sm, uint word) {
  pio_sm_put_blocking(pio, sm, word); //TX FIFOにデータをpush
  //RX FIFOに送信完了通知用の空データが来るのを待つ
  while (pio_sm_is_rx_fifo_empty(pio, sm)) {
    tight_loop_contents();
  }
  int data = pio->rxf[sm]; //読み捨て
}

static void txout_send_sync_bytes(PIO pio, uint sm, uint8_t *buf, int len) {
  for (int i = 0; i < len; i++) {
    uint16_t word = buf[i];
    if (i == len - 1) {
      word |= 0x100; //終端フラグを付与
    }
    txout_send_sync_single_word(pio, sm, word);
  }
}

//------------------------------------------------------------
//frame receiver

static uint16_t decode_received_word(uint32_t val) {
  uint8_t flag = val >> 31 & 1;
  uint8_t byte = val >> 23 % 0xFF;
  return flag << 8 | byte;
}

static inline int16_t rxin_wait_receive_single_word(PIO pio, uint sm) {
  uint cnt = 0;
  //ポーリングでデータが来るまで待つ
  while (pio_sm_is_rx_fifo_empty(pio, sm)) {
    // tight_loop_contents();
    busy_wait_us_32(1);
    if (++cnt > 200) {
      return -1;
    }
  }
  return decode_received_word(pio->rxf[sm]);
}

static int rxin_receive_sync_bytes(PIO pio, uint sm, uint8_t *rcv_buffer, int maxLen) {
  int pos = 0;
  while (pos < maxLen) {
    int16_t val = rxin_wait_receive_single_word(pio, sm);
    if (val == -1) {
      break;
    }
    rcv_buffer[pos++] = val & 0xFF;
    if ((val >> 8) & 1 > 0) {
      //終端フラグ検知
      return pos;
    }
  }
  return 0;
}

//------------------------------------------------------------

#ifdef KM0_RP_SINGLEWIRE__BASE_FREQ_FAST
const float pio_base_freq = 2000000; //base clock 2MHz, data 160kbps
#else
const float pio_base_freq = 1000000; //base clock 1MHz, data 80kbps
#endif

#ifndef KM0_RP_SINGLEWIRE__PIO_INSTANCE
#define KM0_RP_SINGLEWIRE__PIO_INSTANCE pio1
#endif

#ifndef KM0_RP_SINGLEWIRE__PIO_SM_TX
#define KM0_RP_SINGLEWIRE__PIO_SM_TX 0
#endif

#ifndef KM0_RP_SINGLEWIRE__PIO_SM_RX
#define KM0_RP_SINGLEWIRE__PIO_SM_RX 1
#endif

const PIO pio_sw1 = KM0_RP_SINGLEWIRE__PIO_INSTANCE;
const int sm_tx1 = KM0_RP_SINGLEWIRE__PIO_SM_TX;
const int sm_rx1 = KM0_RP_SINGLEWIRE__PIO_SM_RX;

#ifndef KM0_RP_SINGLEWIRE__PIN_SIGNAL
#error KM0_RP_SINGLEWIRE__PIN_SIGNAL should be provided
#endif

static int pin_signal = KM0_RP_SINGLEWIRE__PIN_SIGNAL;

#ifdef KM0_RP_SINGLEWIRE__PIN_DEBUG_TIMING_MONITOR
const int pin_rcv_sideset = KM0_RP_SINGLEWIRE__PIN_DEBUG_TIMING_MONITOR;
#else
const int pin_rcv_sideset = -1;
#endif

#ifndef KM0_RP_SINGLEWIRE__BUFFER_SIZE
#define KM0_RP_SINGLEWIRE__BUFFER_SIZE 16
#endif

#define RawBufferSize KM0_RP_SINGLEWIRE__BUFFER_SIZE

static uint8_t raw_tx_buf[RawBufferSize];
static uint8_t raw_rx_buf[RawBufferSize];
static uint8_t raw_tx_len = 0;
static uint8_t raw_rx_len = 0;

//------------------------------------------------------------

static void setup_programs() {
  uint offset_tx = pio_add_program(pio_sw1, &prog_singlewire_tx_program);
  swtx_program_init(pio_sw1, sm_tx1, offset_tx, pio_base_freq, pin_signal);

  uint offset_rx = pio_add_program(pio_sw1, &prog_singlewire_rx_program);
  swrx_program_init(pio_sw1, sm_rx1, offset_rx, pio_base_freq, pin_signal, pin_rcv_sideset);
}

static void tx_send_frame(uint8_t *buf, int len) {
  busy_wait_us(10);                           //slaveで受信後すぐ送信した場合にmasterで受信できないため送信前にブランクを挟む
  pio_sm_set_enabled(pio_sw1, sm_rx1, false); //受信を無効化
  txout_send_sync_bytes(pio_sw1, sm_tx1, buf, len);
  pio_sm_set_enabled(pio_sw1, sm_rx1, true); //受信を有効化
}

static uint rx_receive_frame(uint8_t *buf, int maxLen) {
  return rxin_receive_sync_bytes(pio_sw1, sm_rx1, buf, maxLen);
}

//------------------------------------------------------------
//pin change interrupt receiver (for slave)

static void (*interrupted_receiver_func)(void) = 0;

static void pin_change_interrupt_handler(uint gpio, uint32_t events) {
  if (gpio == pin_signal && (events & GPIO_IRQ_EDGE_FALL)) {
    gpio_set_irq_enabled(pin_signal, GPIO_IRQ_EDGE_FALL, false);
    // digitalIo_write(pin_debug2, 0);
    raw_rx_len = rx_receive_frame(raw_rx_buf, RawBufferSize);
    raw_tx_len = 0;
    if (interrupted_receiver_func) {
      interrupted_receiver_func();
    }
    if (raw_tx_len > 0) {
      tx_send_frame(raw_tx_buf, raw_tx_len);
    }
    // digitalIo_write(pin_debug2, 1);
    gpio_set_irq_enabled(pin_signal, GPIO_IRQ_EDGE_FALL, true);
  }
}

static void setup_rx_pcint() {
  // digitalIo_setOutput(pin_debug2);
  gpio_set_irq_enabled_with_callback(pin_signal, GPIO_IRQ_EDGE_FALL, true, &pin_change_interrupt_handler);
}

static void deinit_rx_pcint() {
  gpio_set_irq_enabled(pin_signal, GPIO_IRQ_EDGE_FALL, false);
}

//------------------------------------------------------------
//exports

void boardLink_singleWire_setSignalPin(int8_t pin) {
  pin_signal = pin;
}

void boardLink_initialize() {
  setup_programs();
}

void boardLink_writeTxBuffer(uint8_t *buf, uint8_t len) {
  memcpy(raw_tx_buf, buf, len);
  raw_tx_len = len;
}

void boardLink_exchangeFramesBlocking() {
  tx_send_frame(raw_tx_buf, raw_tx_len);
  raw_rx_len = rx_receive_frame(raw_rx_buf, RawBufferSize);
}

uint8_t boardLink_readRxBuffer(uint8_t *buf, uint8_t maxLen) {
  uint8_t len = valueMinimum(raw_rx_len, maxLen);
  memcpy(buf, raw_rx_buf, len);
  return len;
}

void boardLink_setupSlaveReceiver(void (*f)(void)) {
  interrupted_receiver_func = f;
  setup_rx_pcint();
}

void boardLink_clearSlaveReceiver() {
  deinit_rx_pcint();
}
