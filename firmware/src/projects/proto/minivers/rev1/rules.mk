TARGET_MCU = atmega32u4

MODULE_SRCS += km0/common/utils.c
MODULE_SRCS += km0/device_io/atmega/system.c
MODULE_SRCS += km0/device_io/atmega/dio.c
MODULE_SRCS += km0/device_io/atmega/usbioCore.c
MODULE_SRCS += km0/device_io/atmega/dataMemory.c
MODULE_SRCS += km0/device_io/atmega/debugUart.c
MODULE_SRCS += km0/device_io/atmega/singleWire4.c
MODULE_SRCS += km0/keyboard/keyMatrixScanner.c
MODULE_SRCS += km0/keyboard/configuratorServant.c
MODULE_SRCS += km0/keyboard/configValidator.c
MODULE_SRCS += km0/keyboard/keyboardCoreLogic2.c
MODULE_SRCS += km0/keyboard/splitKeyboard.c

PROJECT_SRCS += main.c