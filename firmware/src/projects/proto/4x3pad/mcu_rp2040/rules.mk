MODULE_SRCS += km0/common/utils.c
MODULE_SRCS += km0/device_io/rp2040/system.c
MODULE_SRCS += km0/device_io/rp2040/dio.c
MODULE_SRCS += km0/device_io/rp2040/usbioCore.c
MODULE_SRCS += km0/device_io/rp2040/dataMemory.c
MODULE_SRCS += km0/device_io/rp2040/debugUart.c
# MODULE_SRCS += km0/device_io/general/boardLED.c
MODULE_SRCS += km0/device_io/rp2040/boardLED_RGB.c
MODULE_SRCS += km0/keyboard/keyMatrixScanner.c
MODULE_SRCS += km0/keyboard/configuratorServant.c
MODULE_SRCS += km0/keyboard/configValidator.c
MODULE_SRCS += km0/keyboard/keyboardCoreLogic2.c
MODULE_SRCS += km0/keyboard/generalKeyboard.c

PROJECT_SRCS += main.c
