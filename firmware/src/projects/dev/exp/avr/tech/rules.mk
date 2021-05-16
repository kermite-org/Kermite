#DevTarget := keyboardMatrix
#DevTarget := singlewire
#DevTarget := neopixel
#DevTarget := singlekey

ifeq ($(DevTarget), keyboardMatrix)
MODULE_SRCS += digitalIo.c
MODULE_SRCS += debug_uart.c
MODULE_SRCS += keyMatrixScanner8x8.c
MODULE_SRCS += usbioore.c
MODULE_SRCS += keyboardCore/hidKeyCombinationManager.c
MODULE_SRCS += keyboardCore/dominant/keyInputLogicModel.c
MODULE_SRCS += keyboardCore/dominant/LocalizationKeyMapper/LocalizationKeyMapper.c
MODULE_SRCS += configuratorServant.c
MODULE_SRCS += dataMemory.c
MODULE_SRCS += generalUtils.c
MODULE_SRCS += ConfigurationMemoryReader.c
PROJECT_SRCS += main_keyboard_dev_matrix.c
endif

ifeq ($(DevTarget), singlewire)
MODULE_SRCS += digitalIo.c
MODULE_SRCS += debug_uart.c
MODULE_SRCS += dataMemory.c
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

CFLAGS += -DKM0_ATMEGA_SINGLEWIRE__PIN_SIGNAL_PD2
CFLAGS += -DKM0_ATMEGA_SINGLEWIRE__ENABLE_TIMING_DEBUG_PINS
ASFLAGS += -DKM0_ATMEGA_SINGLEWIRE__PIN_SIGNAL_PD2
ASFLAGS += -DKM0_ATMEGA_SINGLEWIRE__ENABLE_TIMING_DEBUG_PINS

#MODULE_SRCS += singlewire3.c
# MODULE_SRCS += singlewire3a.c
#MODULE_SRCS += singlewire3b.c
#MODULE_SRCS += singlewire3c.c
MODULE_ASM_SRCS += singlewire3d.S

PROJECT_SRCS += main_singlewire3_dev.c

endif


ifeq ($(DevTarget), neopixel)
MODULE_SRCS += digitalIo.c
MODULE_SRCS += debug_uart.c
PROJECT_SRCS += main_neopixel_dev.c
PROJECT_ASM_SRCS += asmdev.S
endif

ifeq ($(DevTarget), singlekey)
MODULE_SRCS += digitalIo.c
MODULE_SRCS += debug_uart.c
MODULE_SRCS += usbIoCore.c
PROJECT_SRCS += main_keyboard_dev_singlekey.c
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



