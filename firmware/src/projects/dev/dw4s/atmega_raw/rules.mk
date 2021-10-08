TARGET_MCU = atmega32u4

MODULE_SRCS += km0/base/utils.c
MODULE_SRCS += km0/device/atmega/system.c
MODULE_SRCS += km0/device/atmega/digitalIo.c
MODULE_SRCS += km0/device/atmega/usbIoCore.c
MODULE_SRCS += km0/device/atmega/dataMemory.c
MODULE_SRCS += km0/device/atmega/debugUart.c
MODULE_SRCS += km0/device/boardIo.c
MODULE_SRCS += km0/device/atmega/boardIoImpl.c
MODULE_SRCS += km0/device/atmega/boardLink_singleWire.c
MODULE_SRCS += km0/kernel/dataStorage.c
MODULE_SRCS += km0/kernel/configManager.c
MODULE_SRCS += km0/kernel/firmwareMetadata.c
MODULE_SRCS += km0/kernel/keyMappingDataValidator.c
MODULE_SRCS += km0/kernel/configuratorServant.c
MODULE_SRCS += km0/kernel/keyCodeTranslator.c
MODULE_SRCS += km0/kernel/keyActionRemapper.c
MODULE_SRCS += km0/kernel/keyboardCoreLogic.c
MODULE_SRCS += km0/kernel/keyboardMain.c
MODULE_SRCS += km0/scanner/keyScanner_directWired.c
MODULE_SRCS += km0/wrapper/splitKeyboard.c

PROJECT_SRCS += main.c
