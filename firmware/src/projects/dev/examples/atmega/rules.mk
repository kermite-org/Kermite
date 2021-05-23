TARGET_MCU = atmega32u4

MODULE_SRCS += km0/device/atmega/system.c
MODULE_SRCS += km0/device/atmega/digitalIo.c
MODULE_SRCS += km0/device/atmega/boardIo.c
MODULE_SRCS += km0/device/atmega/debugUart.c
MODULE_SRCS += km0/device/atmega/dataMemory.c

PROJECT_SRCS += main_blink.c
#PROJECT_SRCS += main_dio.c
#PROJECT_SRCS += main_debugUart.c
#PROJECT_SRCS += main_dataMemory.c
