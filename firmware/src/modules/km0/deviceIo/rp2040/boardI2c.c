#include "km0/deviceIo/boardI2c.h"
#include "pico_sdk/src/common/include/pico/stdlib.h"
#include "pico_sdk/src/rp2_common/include/hardware/i2c.h"

#ifndef KM0_RP_BOARD_I2C__I2C_INSTANCE
#define KM0_RP_BOARD_I2C__I2C_INSTANCE i2c1
#endif

#ifndef KM0_RP_BOARD_I2C__PIN_SDA
#define KM0_RP_BOARD_I2C__PIN_SDA 2
#endif

#ifndef KM0_RP_BOARD_I2C__PIN_SCL
#define KM0_RP_BOARD_I2C__PIN_SCL 3
#endif

static struct i2c_inst *i2c_instance = KM0_RP_BOARD_I2C__I2C_INSTANCE;
static const uint8_t pin_sda = KM0_RP_BOARD_I2C__PIN_SDA;
static const uint8_t pin_scl = KM0_RP_BOARD_I2C__PIN_SCL;

void boardI2c_initialize() {
  uint32_t freqInHz = 4000000;
  i2c_init(i2c_instance, freqInHz);
  gpio_set_function(pin_sda, GPIO_FUNC_I2C);
  gpio_set_function(pin_scl, GPIO_FUNC_I2C);
  gpio_pull_up(pin_sda);
  gpio_pull_up(pin_scl);
}

void boardI2c_write(uint8_t slaveAddress, uint8_t *buf, int len) {
  i2c_write_blocking(i2c_instance, slaveAddress, buf, len, false);
}

void boardI2c_read(uint8_t slaveAddress, uint8_t *buf, int len) {
  i2c_read_blocking(i2c_instance, slaveAddress, buf, len, false);
}
