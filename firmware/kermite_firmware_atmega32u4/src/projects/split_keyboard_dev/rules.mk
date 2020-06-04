MODULE_SRCS += pio.c
MODULE_SRCS += debug_uart.c
MODULE_SRCS += KeyMatrixScanner2.c
MODULE_SRCS += usbiocore.c
MODULE_SRCS += configuratorServant.c
MODULE_SRCS += xf_eeprom.c
MODULE_SRCS += generalUtils.c
MODULE_SRCS += ConfigurationMemoryReader.c
MODULE_SRCS += keyboardCoreLogic.c

CFLAGS += -DSINGLEWIRE_SIGNAL_PIN_PD2
MODULE_SRCS += singlewire3a.c

PROJECT_SRCS += main.c
