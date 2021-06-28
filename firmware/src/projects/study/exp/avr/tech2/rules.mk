TARGET_MCU = atmega32u4

MODULE_SRCS += km0/base/utils.c
MODULE_SRCS += km0/device/atmega/system.c
MODULE_SRCS += km0/device/atmega/digitalIo.c
MODULE_SRCS += km0/device/atmega/debugUart.c
MODULE_SRCS += km0/device/atmega/boardIo.c

# PROJECT_SRCS += main_i2c_oled_minimum.c
# PROJECT_SRCS += main_i2c_tca9555.c
PROJECT_SRCS += main_encoder_dev.c