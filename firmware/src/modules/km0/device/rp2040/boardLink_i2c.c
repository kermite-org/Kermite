#include "km0/base/utils.h"
#include "km0/device/boardLink.h"
#include "pico_sdk/src/common/include/pico/stdlib.h"
#include "pico_sdk/src/rp2_common/include/hardware/i2c.h"
#include "pico_sdk/src/rp2_common/include/hardware/irq.h"
#include "string.h"

//----------------------------------------------------------------------

#ifndef KM0_RP_BOARD_LINK_I2C__I2C_INSTANCE_INDEX
#define KM0_RP_BOARD_LINK_I2C__I2C_INSTANCE_INDEX 1
#endif

#ifndef KM0_RP_BOARD_LINK_I2C__FREQUENCY
#define KM0_RP_BOARD_LINK_I2C__FREQUENCY 1000000
#endif

#ifndef KM0_RP_BOARD_LINK_I2C__SLAVE_ADDRESS
#define KM0_RP_BOARD_LINK_I2C__SLAVE_ADDRESS 0x11
#endif

#ifndef KM0_RP_BOARD_LINK_I2C__PIN_SDA
#define KM0_RP_BOARD_LINK_I2C__PIN_SDA 2
#endif

#ifndef KM0_RP_BOARD_LINK_I2C__PIN_SCL
#define KM0_RP_BOARD_LINK_I2C__PIN_SCL 3
#endif

#ifndef KM0_RP_BOARD_LINK_I2C__BUFFER_SIZE
#define KM0_RP_BOARD_LINK_I2C__BUFFER_SIZE 16
#endif

static const uint32_t i2cFrequency = KM0_RP_BOARD_LINK_I2C__FREQUENCY;

//I2Cスレーブのアドレス, 7ビットで指定
static const uint8_t i2cSlaveAddress = KM0_RP_BOARD_LINK_I2C__SLAVE_ADDRESS;

#if KM0_RP_BOARD_LINK_I2C__I2C_INSTANCE_INDEX == 0
static struct i2c_inst *i2c_instance = i2c0;
#define I2C_INSTANCE_IRQ I2C0_IRQ
#define i2c_instance_irq_handler i2c0_irq_handler
#elif KM0_RP_BOARD_LINK_I2C__I2C_INSTANCE_INDEX == 1
static struct i2c_inst *i2c_instance = i2c1;
#define I2C_INSTANCE_IRQ I2C1_IRQ
#define i2c_instance_irq_handler i2c1_irq_handler
#else
#error invalid KM0_RP_BOARD_LINK_I2C__I2C_INSTANCE_INDEX
#endif

static const uint8_t pin_sda = KM0_RP_BOARD_LINK_I2C__PIN_SDA;
static const uint8_t pin_scl = KM0_RP_BOARD_LINK_I2C__PIN_SCL;

#define RawBufferSize (KM0_RP_BOARD_LINK_I2C__BUFFER_SIZE + 1)

//送信/受信フレーム形式
//0x~ SS BB BB BB ...
//SS: フレームボディのサイズ
//BB BB BB ...: ボディ, SS bytes

//i2cの送信/受信フレームの先頭に送るデータのサイズを格納することで、
//サイズが決まっていないデータの送受信ができるようにする

static uint8_t raw_rx_buf[RawBufferSize]; //受信バッファ, 先頭にデータサイズを含まない
static uint8_t raw_rx_pos = 0;
static uint8_t raw_rx_body_len = 0;

static uint8_t raw_tx_buf[RawBufferSize]; //送信バッファ, 先頭にデータサイズを含む
static uint8_t raw_tx_pos = 0;
static uint8_t raw_tx_len = 0;

static void (*slaveReceiverCallback)() = NULL;

//----------------------------------------------------------------------

void boardLink_writeTxBuffer(uint8_t *buf, uint8_t len) {
  raw_tx_buf[0] = len;
  memcpy(raw_tx_buf + 1, buf, len);
  raw_tx_len = len + 1;
}

uint8_t boardLink_readRxBuffer(uint8_t *buf, uint8_t maxLen) {
  uint8_t len = valueMinimum(raw_rx_body_len, maxLen);
  memcpy(buf, raw_rx_buf, len);
  return len;
}

void boardLink_initialize() {
  i2c_init(i2c_instance, i2cFrequency);
  gpio_set_function(pin_sda, GPIO_FUNC_I2C);
  gpio_set_function(pin_scl, GPIO_FUNC_I2C);
  gpio_pull_up(pin_sda);
  gpio_pull_up(pin_scl);
}

void boardLink_exchangeFramesBlocking() {
  i2c_write_blocking(i2c_instance, i2cSlaveAddress, raw_tx_buf, raw_tx_len, true);
  i2c_read_blocking(i2c_instance, i2cSlaveAddress, raw_rx_buf, 1, false);
  raw_rx_body_len = raw_rx_buf[0];
  if (raw_rx_body_len > 0) {
    i2c_read_blocking(i2c_instance, i2cSlaveAddress, raw_rx_buf, raw_rx_body_len, false);
  }
}

static void i2c_instance_irq_handler() {
  uint32_t status = i2c_instance->hw->intr_stat;

  if (status & I2C_IC_INTR_STAT_R_RX_FULL_BITS) {
    //受信完了, RX FIFOからデータを読み取る
    uint32_t data = i2c_instance->hw->data_cmd;

    uint8_t value = data & I2C_IC_DATA_CMD_DAT_BITS;
    if (data & I2C_IC_DATA_CMD_FIRST_DATA_BYTE_BITS) {
      //先頭のバイトを受信 (データサイズを設定)
      raw_rx_body_len = value;
      raw_rx_pos = 0;
    } else {
      //後続のバイトを受信 (データ本体を受け取る)
      if (raw_rx_pos < raw_rx_body_len) {
        raw_rx_buf[raw_rx_pos] = value;
        raw_rx_pos++;
        if (raw_rx_pos == raw_rx_body_len) {
          raw_tx_len = 0;
          raw_tx_buf[0] = 0;
          if (slaveReceiverCallback) {
            slaveReceiverCallback();
          }
          raw_tx_pos = 0;
        }
      }
    }

  } else if (status & I2C_IC_INTR_STAT_R_RD_REQ_BITS) {
    //データ送信要求に応答する
    uint8_t res_value = 0;
    if (raw_tx_pos < raw_tx_len) {
      res_value = raw_tx_buf[raw_tx_pos++];
    }
    i2c_instance->hw->data_cmd = (uint32_t)res_value;
    i2c_instance->hw->clr_rd_req;
  }
}

void boardLink_setupSlaveReceiver(void (*callback)()) {
  i2c_set_slave_mode(i2c_instance, true, i2cSlaveAddress);
  slaveReceiverCallback = callback;
  i2c_instance->hw->intr_mask = (I2C_IC_INTR_MASK_M_RD_REQ_BITS | I2C_IC_INTR_MASK_M_RX_FULL_BITS);
  irq_set_exclusive_handler(I2C_INSTANCE_IRQ, i2c_instance_irq_handler);
  irq_set_enabled(I2C_INSTANCE_IRQ, true);
}

void boardLink_clearSlaveReceiver() {
  slaveReceiverCallback = NULL;
  i2c_instance->hw->intr_mask = 0;
  irq_remove_handler(I2C_INSTANCE_IRQ, i2c_instance_irq_handler);
  irq_set_enabled(I2C_INSTANCE_IRQ, false);
  i2c_set_slave_mode(i2c_instance, false, 0);
}
