TARGET_MCU = atmega32u4

MODULE_SRCS += km0/common/utils.c
MODULE_SRCS += km0/deviceIo/atmega/system.c
MODULE_SRCS += km0/deviceIo/atmega/dio.c
MODULE_SRCS += km0/deviceIo/atmega/boardIo.c
MODULE_SRCS += km0/deviceIo/atmega/usbIoCore.c
MODULE_SRCS += km0/deviceIo/atmega/dataMemory.c
MODULE_SRCS += km0/deviceIo/atmega/debugUart.c
MODULE_SRCS += km0/deviceIo/atmega/boardLink_singleWire.c
MODULE_SRCS += km0/keyboard/keyScanner_basicMatrix.c
MODULE_SRCS += km0/keyboard/dataStorage.c
MODULE_SRCS += km0/keyboard/configManager.c
MODULE_SRCS += km0/keyboard/keyMappingDataValidator.c
MODULE_SRCS += km0/keyboard/configuratorServant.c
MODULE_SRCS += km0/keyboard/keyCodeTranslator.c
MODULE_SRCS += km0/keyboard/keyActionRemapper.c
MODULE_SRCS += km0/keyboard/keyboardCoreLogic.c
MODULE_SRCS += km0/keyboard/keyboardMain.c
MODULE_SRCS += km0/keyboard/splitKeyboard.c

PROJECT_SRCS += main.c