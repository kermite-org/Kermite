TARGET_MCU = atmega32u4
TARGET_STENCIL = stencil_general

KL_USE_BOARD_LEDS_PROMICRO_AVR = 1
KL_USE_DEBUG_UART = 1
KL_USE_OLED_DISPLAY = 1
KL_USE_RGB_LIGHTING = 1
KL_USE_KEYS_DIRECT_WIRED = 1
 
# KL_USE_SPLIT_KEYBOARD = 1

MODULE_SRCS += km0/device/atmega/boardLink_singleWire.c
MODULE_SRCS += km0/wrapper/splitKeyboard2.c
DEFINES += KS_USE_SPLIT_KEYBOARD