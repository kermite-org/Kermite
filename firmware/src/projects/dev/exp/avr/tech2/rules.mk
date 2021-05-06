TARGET_MCU = atmega32u4

MODULE_SRCS += km0/common/utils.c
MODULE_SRCS += km0/deviceIo/atmega/system.c
MODULE_SRCS += km0/deviceIo/atmega/dio.c
MODULE_SRCS += km0/deviceIo/atmega/debugUart.c
MODULE_SRCS += km0/deviceIo/atmega/boardIo.c

PROJECT_SRCS += main_i2c_oled_minimum.c
