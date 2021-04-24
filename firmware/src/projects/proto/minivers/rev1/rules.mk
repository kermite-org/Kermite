WORKER = worker_atmega32u4

MODULE_SRCS += km0/common/utils.c
MODULE_SRCS += km0/deviceIo/atmega/system.c
MODULE_SRCS += km0/deviceIo/atmega/dio.c
MODULE_SRCS += km0/deviceIo/atmega/boardIo.c
MODULE_SRCS += km0/deviceIo/atmega/usbIoCore.c
MODULE_SRCS += km0/deviceIo/atmega/dataMemory.c
MODULE_SRCS += km0/deviceIo/atmega/debugUart.c
MODULE_SRCS += km0/deviceIo/atmega/singleWire4.c
MODULE_SRCS += km0/keyboard/keyMatrixScanner.c
MODULE_SRCS += km0/keyboard/configuratorServant.c
MODULE_SRCS += km0/keyboard/configValidator.c
MODULE_SRCS += km0/keyboard/keyboardCoreLogic.c
MODULE_SRCS += km0/keyboard/splitKeyboard.c

PROJECT_SRCS += main.c