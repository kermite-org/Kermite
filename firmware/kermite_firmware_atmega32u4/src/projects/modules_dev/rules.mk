#DevTarget := blink
#DevTarget := DebugUartTest
#DevTarget := KeyboardMatrix
DevTarget := singlewire
#DevTarget := neopixel
#DevTarget := singlekey
#DevTarget := eeprom

ifeq ($(DevTarget), blink)
MODULE_SRCS += pio.c
PROJECT_SRCS += main_blink.c
endif

ifeq ($(DevTarget), DebugUartTest)
MODULE_SRCS += pio.c
MODULE_SRCS += debug_uart.c
PROJECT_SRCS += main_debug_uart_test.c
endif

ifeq ($(DevTarget), KeyboardMatrix)
MODULE_SRCS += pio.c
MODULE_SRCS += debug_uart.c
MODULE_SRCS += keyMatrixScanner8x8.c
MODULE_SRCS += usbiocore.c
MODULE_SRCS += keyboardCore/hidKeyCombinationManager.c
MODULE_SRCS += keyboardCore/dominant/keyInputLogicModel.c
MODULE_SRCS += keyboardCore/dominant/LocalizationKeyMapper/LocalizationKeyMapper.c
MODULE_SRCS += configuratorServant.c
MODULE_SRCS += eeprom.c
MODULE_SRCS += generalUtils.c
MODULE_SRCS += ConfigurationMemoryReader.c
PROJECT_SRCS += main_keyboard_dev_matrix.c
endif

ifeq ($(DevTarget), singlewire)
MODULE_SRCS += pio.c
MODULE_SRCS += debug_uart.c
MODULE_SRCS += xf_eeprom.c
MODULE_SRCS += generalUtils.c

#v0
#MODULE_SRCS += singlewire_impl_pulseratio.c
#PROJECT_SRCS += main_singlewire_dev.c
#v1
#MODULE_SRCS += singlewire_impl_binarypulse.c
#PROJECT_SRCS += main_singlewire_dev.c
#v2
# MODULE_SRCS += singlewire2_cpart.c
#MODULE_ASM_SRCS += singlewire2.S
#PROJECT_SRCS += main_singlewire_dev2.c

# PROJECT_SRCS += main_singlewire_devC.c
# PROJECT_ASM_SRCS += asmdev.S

CFLAGS += -DSINGLEWIRE_SIGNAL_PIN_PD2
CFLAGS += -DSINGLEWIRE_ENABLE_TIMING_DEBUG_PINS
ASFLAGS += -DSINGLEWIRE_SIGNAL_PIN_PD2
ASFLAGS += -DSINGLEWIRE_ENABLE_TIMING_DEBUG_PINS

#MODULE_SRCS += singlewire3.c
# MODULE_SRCS += singlewire3a.c
#MODULE_SRCS += singlewire3b.c
#MODULE_SRCS += singlewire3c.c
MODULE_ASM_SRCS += singlewire3d.S

PROJECT_SRCS += main_singlewire3_dev.c

endif


ifeq ($(DevTarget), neopixel)
MODULE_SRCS += pio.c
MODULE_SRCS += debug_uart.c
PROJECT_SRCS += main_neopixel_dev.c
PROJECT_ASM_SRCS += asmdev.S
endif

ifeq ($(DevTarget), singlekey)
MODULE_SRCS += pio.c
MODULE_SRCS += debug_uart.c
MODULE_SRCS += usbiocore.c
PROJECT_SRCS += main_keyboard_dev_singlekey.c
endif

ifeq ($(DevTarget), eeprom)
MODULE_SRCS += pio.c
MODULE_SRCS += debug_uart.c
MODULE_SRCS += xf_eeprom.c
PROJECT_SRCS += main_eeprom_dev.c
endif

#SRCS += main_singlewire_dev.c
#SRCS += singlewire_impl_pulseratio.c
#SRCS += main_singlewire_dev.c
#SRCS += singlewire_impl_binarypulse.c
#SRCS += main_software_uart_dev.c

#SRCS += main_usbiocore_keyboard_dev.c
#SRCS += usbiocore.c

#SRCS += main_singlewire_dev_binarypulse.c
#SRCS += main_key_matrix_scan_dev.c
# SRCS += main_key_matrix_scan_dev1.c
# SRCS += keyMatrixScanner8x8.c
# SRCS += usbiocore.c
#SRCS += main_hdc_dev2.c
#SRCS += main_neopixel_dev.c
#SRCS += main.c
#SRCS += usbdev.c
#SRCS += teensy_usb_wrapper.c
#SRCS += easyTimer.c
#SRCS += main_easyTimer_dev.c



