TARGET_MCU = atmega32u4

#peripheral wrappers
MODULE_SRCS += km0/base/utils.c
MODULE_SRCS += km0/device/atmega/system.c
MODULE_SRCS += km0/device/atmega/digitalIo.c
MODULE_SRCS += km0/device/atmega/usbIoCore.c
MODULE_SRCS += km0/device/atmega/dataMemory.c
MODULE_SRCS += km0/device/atmega/boardI2c.c

#keyboard core modules
MODULE_SRCS += km0/kernel/dataStorage.c
MODULE_SRCS += km0/kernel/configManager.c
MODULE_SRCS += km0/kernel/keyMappingDataValidator.c
MODULE_SRCS += km0/kernel/configuratorServant.c
MODULE_SRCS += km0/kernel/keyCodeTranslator.c
MODULE_SRCS += km0/kernel/keyActionRemapper.c
MODULE_SRCS += km0/kernel/keyboardCoreLogic.c
MODULE_SRCS += km0/kernel/keyboardMain.c

#scanner
MODULE_SRCS += km0/scanner/keyScanner_basicMatrix.c

#board leds
ifneq ($(KL_USE_PROMICRO_BOARD_LEDS),)
MODULE_SRCS += km0/device/atmega/boardIo.c
DEFINES += KS_USE_PROMICRO_BOARD_LEDS
else
# MODULE_SRCS += km0/device/boardIo_dummy.c	//TODO: use this
MODULE_SRCS += km0/device/atmega/boardIo.c
endif

#debug uart
ifneq ($(KL_USE_DEBUG_UART),)
MODULE_SRCS += km0/device/atmega/debugUart.c
DEFINES += KS_USE_DEBUG_UART
endif

#oled
ifneq ($(KL_USE_OLED),)
MODULE_SRCS += km0/visualizer/oledDisplay_atmega/oledCore.c
MODULE_SRCS += km0/visualizer/oledDisplay_atmega/oledDisplay_default.c
DEFINES += KS_USE_OLED
endif

#rgb lighting
ifneq ($(KL_USE_RGB_LIGHTING),)
MODULE_ASM_SRCS += km0/device/atmega/neoPixelCore.S
MODULE_SRCS += km0/device/atmega/serialLed.c
MODULE_SRCS += km0/visualizer/rgbLighting.c
DEFINES += KS_USE_RGB_LIGHTING
endif

ifneq ($(KL_USE_SPLIT_KEYBOARD),)
#split keyboard
MODULE_SRCS += km0/device/atmega/boardLink_singleWire.c
MODULE_SRCS += km0/wrapper/splitKeyboard.c
DEFINES += KS_USE_SPLIT_KEYBOARD
else
#unified keyboard
MODULE_SRCS += km0/wrapper/generalKeyboard.c
endif

PROJECT_STENCIL_SRCS += main.c
