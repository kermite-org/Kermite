TARGET_MCU = rp2040

MODULE_SRCS += km0/common/utils.c
MODULE_SRCS += km0/device_io/rp2040/system.c
MODULE_SRCS += km0/device_io/rp2040/dio.c
MODULE_SRCS += km0/device_io/rp2040/usbIoCore.c
MODULE_SRCS += km0/device_io/rp2040/dataMemory.c
MODULE_SRCS += km0/device_io/rp2040/debugUart.c
MODULE_SRCS += km0/device_io/rp2040/boardIo.c
MODULE_SRCS += km0/keyboard/keyMatrixScanner.c
MODULE_SRCS += km0/keyboard/configuratorServant.c
MODULE_SRCS += km0/keyboard/configValidator.c
MODULE_SRCS += km0/keyboard/keyboardCoreLogic2.c
MODULE_SRCS += km0/device_io/rp2040/singleWire4.c
MODULE_PIOASM_SRCS += km0/device_io/rp2040/singleWire4.pio
MODULE_SRCS += km0/keyboard/splitKeyboard.c

PROJECT_SRCS += main.c
