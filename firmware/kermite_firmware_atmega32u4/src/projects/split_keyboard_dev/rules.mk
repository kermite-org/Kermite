MODULE_SRCS += pio.c
MODULE_SRCS += debug_uart.c
MODULE_SRCS += KeyMatrixScanner2.c
MODULE_SRCS += usbiocore.c
MODULE_SRCS += configuratorServant.c
MODULE_SRCS += xf_eeprom.c
MODULE_SRCS += generalUtils.c
MODULE_SRCS += ConfigurationMemoryReader.c
MODULE_SRCS += keyboardCoreLogic.c

#ASFLAGS += -DMODULE_OPTIONS_SINGLEWIRE2_SIGNAL_PIN_PD0
ASFLAGS += -DMODULE_OPTIONS_SINGLEWIRE2_SIGNAL_PIN_PD2
MODULE_ASM_SRCS += singlewire2.S

PROJECT_SRCS += main.c
