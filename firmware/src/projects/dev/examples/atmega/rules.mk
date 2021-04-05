TARGET_MCU = atmega32u4

MODULE_SRCS += km0/device_io/atmega/system.c
MODULE_SRCS += km0/device_io/atmega/dio.c
MODULE_SRCS += km0/device_io/atmega/boardIo.c
MODULE_SRCS += km0/device_io/atmega/debugUart.c
MODULE_SRCS += km0/device_io/atmega/dataMemory.c

PROJECT_SRCS += main_blink.c
#PROJECT_SRCS += main_dio.c
#PROJECT_SRCS += main_debugUart.c
#PROJECT_SRCS += main_dataMemory.c
