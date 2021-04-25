TARGET_MCU = rp2040

MODULE_SRCS += km0/common/utils.c
MODULE_SRCS += km0/deviceIo/rp2040/system.c
MODULE_SRCS += km0/deviceIo/rp2040/dio.c
MODULE_SRCS += km0/deviceIo/rp2040/usbIoCore.c
MODULE_SRCS += km0/deviceIo/rp2040/dataMemory.c
MODULE_SRCS += km0/deviceIo/rp2040/debugUart.c
MODULE_SRCS += km0/deviceIo/rp2040/boardIo.c
MODULE_SRCS += km0/keyboard/keyScanner_basicMatrix.c
MODULE_SRCS += km0/keyboard/configuratorServant.c
MODULE_SRCS += km0/keyboard/configValidator.c
MODULE_SRCS += km0/keyboard/keyboardCoreLogic.c
MODULE_SRCS += km0/keyboard/generalKeyboard.c

PROJECT_SRCS += main.c
