TARGET_MCU = rp2040

MODULE_SRCS += km0/common/utils.c
MODULE_SRCS += km0/deviceIo/rp2040/system.c
MODULE_SRCS += km0/deviceIo/rp2040/dio.c
MODULE_SRCS += km0/deviceIo/rp2040/usbIoCore.c
MODULE_SRCS += km0/deviceIo/rp2040/dataMemory.c
MODULE_SRCS += km0/deviceIo/rp2040/debugUart.c
MODULE_SRCS += km0/deviceIo/rp2040/boardIo.c
MODULE_SRCS += km0/deviceIo/rp2040/boardI2c.c
MODULE_SRCS += km0/keyboard/keyScanner_directWired.c
MODULE_SRCS += km0/keyboard/dataStorage.c
MODULE_SRCS += km0/keyboard/configManager.c
MODULE_SRCS += km0/keyboard/keyAssignsDataValidator.c
MODULE_SRCS += km0/keyboard/configuratorServant.c
MODULE_SRCS += km0/keyboard/keyCodeTable.c
MODULE_SRCS += km0/keyboard/keyboardCoreLogic.c
MODULE_SRCS += km0/keyboard/keyboardMain.c
MODULE_SRCS += km0/keyboard/generalKeyboard.c
MODULE_SRCS += km0/visualizer/oledDisplay_rp/oledCoreEx.c
MODULE_SRCS += km0/visualizer/oledDisplay_rp/oledDisplayEx_default.c

PROJECT_SRCS += main.c
