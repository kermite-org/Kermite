MODULE_SRCS += km0/common/utils.c

MODULE_SRCS += km0/device_io/atmega32/pio.c
MODULE_SRCS += km0/device_io/atmega32/debugUart.c
MODULE_SRCS += km0/device_io/atmega32/usbioCore.c
MODULE_SRCS += km0/device_io/atmega32/eeprom.c

MODULE_SRCS += km0/keyboard/keyMatrixScanner2.c
MODULE_SRCS += km0/keyboard/configuratorServant.c
MODULE_SRCS += km0/keyboard/configValidator.c
MODULE_SRCS += km0/keyboard/keyboardCoreLogic2.c
MODULE_SRCS += km0/keyboard/generalKeyboard.c

PROJECT_SRCS += main.c
