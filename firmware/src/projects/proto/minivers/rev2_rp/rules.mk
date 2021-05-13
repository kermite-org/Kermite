TARGET_MCU = rp2040

MODULE_SRCS += km0/common/utils.c
MODULE_SRCS += km0/deviceIo/rp2040/system.c
MODULE_SRCS += km0/deviceIo/rp2040/dio.c
MODULE_SRCS += km0/deviceIo/rp2040/usbIoCore.c
MODULE_SRCS += km0/deviceIo/rp2040/dataMemory.c
MODULE_SRCS += km0/deviceIo/rp2040/debugUart.c
MODULE_SRCS += km0/deviceIo/rp2040/boardIo_rgbLed.c
MODULE_SRCS += km0/deviceIo/rp2040/neoPixelCore.c
MODULE_PIOASM_SRCS += km0/deviceIo/rp2040/neoPixelCore.pio
MODULE_SRCS += km0/deviceIo/rp2040/boardLink_singleWire.c
MODULE_PIOASM_SRCS += km0/deviceIo/rp2040/singleWire4.pio
MODULE_SRCS += km0/keyboard/keyScanner_basicMatrix.c
MODULE_SRCS += km0/keyboard/dataStorage.c
MODULE_SRCS += km0/keyboard/configManager.c
MODULE_SRCS += km0/keyboard/keyAssignsDataValidator.c
MODULE_SRCS += km0/keyboard/configuratorServant.c
MODULE_SRCS += km0/keyboard/keyCodeMapper.c
MODULE_SRCS += km0/keyboard/keyboardCoreLogic.c
MODULE_SRCS += km0/keyboard/keyboardMain.c
MODULE_SRCS += km0/keyboard/splitKeyboard.c

PROJECT_SRCS += main.c
