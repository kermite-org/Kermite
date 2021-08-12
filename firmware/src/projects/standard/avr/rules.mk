TARGET_MCU = atmega32u4

MODULE_SRCS += km0/device/atmega/system.c
MODULE_SRCS += km0/device/atmega/digitalIo.c
MODULE_SRCS += km0/device/atmega/boardIo.c
MODULE_SRCS += km0/device/atmega/debugUart.c

PROJECT_SRCS += main.c