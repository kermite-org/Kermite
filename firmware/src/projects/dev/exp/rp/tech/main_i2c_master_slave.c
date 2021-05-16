#include "hardware/i2c.h"
#include "hardware/irq.h"
#include "km0/common/utils.h"
#include "km0/deviceIo/boardIo.h"
#include "km0/deviceIo/debugUart.h"
#include "km0/deviceIo/dio.h"
#include "km0/deviceIo/system.h"
#include "pico/binary_info.h"
#include "pico/stdlib.h"
#include "string.h"
#include <stdio.h>

//----------------------------------------------------------------------

//Master
//board RPi Pico
//GP0 debug uart ---> USB-UART --> PC
//GP25 onboard LED
//GP2 I2C1_SDA <--> Slave SDA ---> LogicAnalyzer ch2
//GP3 I2C1_SCL ---> Slave SCL ---> LogicAnalyzer ch1
//GP28 masater/slave flag <--- GND for master
//GP27 timing debug pin ---> LogicAnalyzer ch0

//Slave
//board RPi Pico
//GP0 debug uart ---> USB-UART --> PC
//GP25 onboard LED
//GP2 I2C1_SDA <--> Master SDA
//GP3 I2C1_SCL <--- Master SCL
//GP28 masater/slave flag <--- NC for slave
//GP27 timing debug pin ---> LogicAnalyzer ch3

//----------------------------------------------------------------------

#define valueMinimum(a, b) (a < b ? a : b)

//----------------------------------------------------------------------

const int pin_debug0 = GP22;

void initDebugPins() {
  dio_setOutput(pin_debug0);
  dio_write(pin_debug0, 1);
}

void debugPin0_setHigh() {
  dio_write(pin_debug0, 1);
}

void debugPin0_setLow() {
  dio_write(pin_debug0, 0);
}

void debugPin0_toggle() {
  dio_toggle(pin_debug0);
}

//----------------------------------------------------------------------

//slaveAddress: I2Cスレーブのアドレス, 7ビットで指定

void boardSyncDev_initialize();

void boardSyncDev_writeTxBuffer(uint8_t *buf, uint8_t len);
uint8_t boardSyncDev_readRxBuffer(uint8_t *buf, uint8_t maxLen);
void boardSyncDev_exchangeFramesBlocking(); //送信+受信

void boardSyncDev_setupSlaveReceiver(void (*callback)());
void boardSyncDev_clearSlaveReceiver();

//----------------------------------------------------------------------

static const uint32_t i2cFrequency = 1000 * 1000;
static const uint8_t i2cSlaveAddress = 0x11;

#define I2C_INSTANCE_IRQ I2C1_IRQ
#define i2c_instance_irq_handler i2c1_irq_handler
static struct i2c_inst *i2c_instance = i2c1;

static const uint8_t pin_sda = 2;
static const uint8_t pin_scl = 3;

//送信/受信フレーム形式
//0x~ SS BB BB BB ...
//SS: フレームボディのサイズ
//BB BB BB ...: ボディ, SS bytes

//i2cの送信/受信フレームの先頭に送るデータのサイズを入れることで、
//サイズが決まっていないデータの送受信ができるようにする

static uint8_t raw_rx_buf[256]; //受信バッファ, 先頭にデータサイズを含まない
static uint8_t raw_rx_pos = 0;
static uint8_t raw_rx_body_len = 0;

static uint8_t raw_tx_buf[256]; //送信バッファ, 先頭にデータサイズを含む
static uint8_t raw_tx_pos = 0;
static uint8_t raw_tx_len = 0;

static void (*slaveReceiverCallback)() = NULL;

void boardSyncDev_writeTxBuffer(uint8_t *buf, uint8_t len) {
  raw_tx_buf[0] = len;
  memcpy(raw_tx_buf + 1, buf, len);
  raw_tx_len = len + 1;
}

uint8_t boardSyncDev_readRxBuffer(uint8_t *buf, uint8_t maxLen) {
  uint8_t len = valueMinimum(raw_rx_body_len, maxLen);
  memcpy(buf, raw_rx_buf, len);
  return len;
}

void boardSyncDev_initialize() {
  i2c_init(i2c_instance, i2cFrequency);
  gpio_set_function(pin_sda, GPIO_FUNC_I2C);
  gpio_set_function(pin_scl, GPIO_FUNC_I2C);
  gpio_pull_up(pin_sda);
  gpio_pull_up(pin_scl);
}

void boardSyncDev_exchangeFramesBlocking() {
  printf("sending %d bytes\n", raw_tx_len);
  debugPin0_setLow();
  i2c_write_blocking(i2c_instance, i2cSlaveAddress, raw_tx_buf, raw_tx_len, true);
  i2c_read_blocking(i2c_instance, i2cSlaveAddress, raw_rx_buf, 1, false);
  raw_rx_body_len = raw_rx_buf[0];
  if (raw_rx_body_len > 0) {
    i2c_read_blocking(i2c_instance, i2cSlaveAddress, raw_rx_buf, raw_rx_body_len, false);
  }
  debugPin0_setHigh();
}

static void i2c_instance_irq_handler() {
  debugPin0_setLow();

  uint32_t status = i2c_instance->hw->intr_stat;

  // printf("-------- i2c irq --------, %x\n", status);

  if (status & I2C_IC_INTR_STAT_R_RX_FULL_BITS) {
    //受信完了, RX FIFOからデータを読み取る
    uint32_t data = i2c_instance->hw->data_cmd;
    // printf("[-->] i2c data_cmd, %x\n", data);
    uint8_t value = data & I2C_IC_DATA_CMD_DAT_BITS;
    if (data & I2C_IC_DATA_CMD_FIRST_DATA_BYTE_BITS) {
      //先頭のバイトを受信 (データサイズを設定)
      // printf("i2c received first, %x\n", value);
      raw_rx_body_len = value;
      raw_rx_pos = 0;
    } else {
      //後続のバイトを受信 (データ本体を受け取り)
      // printf("i2c received data, %x\n", value);
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
    // printf("[<--] i2c read requested %d\n", raw_tx_pos);
    uint8_t res_value = 0;
    if (raw_tx_pos < raw_tx_len) {
      res_value = raw_tx_buf[raw_tx_pos++];
    }
    // printf("returning %d \n", res_value);
    i2c_instance->hw->data_cmd = (uint32_t)res_value;
    i2c_instance->hw->clr_rd_req;
  }
  debugPin0_setHigh();
}

void boardSyncDev_setupSlaveReceiver(void (*callback)()) {
  i2c_set_slave_mode(i2c_instance, true, i2cSlaveAddress);
  slaveReceiverCallback = callback;
  i2c_instance->hw->intr_mask = (I2C_IC_INTR_MASK_M_RD_REQ_BITS | I2C_IC_INTR_MASK_M_RX_FULL_BITS);
  irq_set_exclusive_handler(I2C_INSTANCE_IRQ, i2c_instance_irq_handler);
  irq_set_enabled(I2C_INSTANCE_IRQ, true);
}

void boardSyncDev_clearSlaveReceiver() {
  slaveReceiverCallback = NULL;
  i2c_instance->hw->intr_mask = 0;
  irq_remove_handler(I2C_INSTANCE_IRQ, i2c_instance_irq_handler);
  irq_set_enabled(I2C_INSTANCE_IRQ, false);
  i2c_set_slave_mode(i2c_instance, false, 0);
}

//----------------------------------------------------------------------

uint8_t m_txbuf[2] = { 0xAB, 0xCD };
uint8_t m_rxbuf[4];

void runAsMaster() {
  printf("run as master mode\n");
  boardSyncDev_initialize();
  initDebugPins();

  while (true) {
    boardIo_toggleLed1();
    delayMs(1000);

    boardSyncDev_writeTxBuffer(m_txbuf, 2);
    boardSyncDev_exchangeFramesBlocking();
    uint8_t sz = boardSyncDev_readRxBuffer(m_rxbuf, 2);
    printf("received: %d bytes\n", sz);
    utils_debugShowBytes(m_rxbuf, sz);
  }
}

//----------------------------------------------------------------------

uint8_t s_tx_buf[4];
uint8_t s_rx_buf[4];

void app_onFrameReceived() {
  uint8_t len = boardSyncDev_readRxBuffer(s_rx_buf, 4);
  printf("data received, %d bytes\n", len);
  utils_debugShowBytes(s_rx_buf, len);
  if (s_rx_buf[0] == 0xAB && len == 2) {
    s_tx_buf[0] = 0x67;
    s_tx_buf[1] = 0x89;
    boardSyncDev_writeTxBuffer(s_tx_buf, 2);
  }
}

void runAsSlave() {
  initDebugPins();
  boardSyncDev_initialize();
  boardSyncDev_setupSlaveReceiver(app_onFrameReceived);

  while (true) {
    boardIo_toggleLed1();
    delayMs(1000);
  }
}

//----------------------------------------------------------------------

const int pin_master_slave_flag = GP28;

int main() {
  debugUart_initialize(115200);
  boardIo_setupLeds_rpiPico();
  dio_setInputPullup(pin_master_slave_flag);
  delayMs(1);
  bool isMaster = dio_read(pin_master_slave_flag) == 0;
  if (isMaster) {
    runAsMaster();
  } else {
    runAsSlave();
  }
}
