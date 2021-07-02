TARGET_MCU = atmega32u4
TARGET_STENCIL = stencil_default

KL_USE_GENERAL_KEYBOARD = 1
KL_USE_BOARD_LEDS_PROMICRO_AVR = 1
# KL_USE_DEBUG_UART = 1
KL_USE_OLED_DISPLAY = 1
KL_USE_RGB_LIGHTING = 1
KL_USE_KEY_MATRIX = 1

# KL_USE_ENCODERS = 1
# use new implementation
MODULE_SRCS += km0/scanner/keyScanner_encoderImproved_atmega.c
MODULE_SRCS += km0/device/atmega/pinObserver.c
DEFINES += KS_USE_ENCODERS
