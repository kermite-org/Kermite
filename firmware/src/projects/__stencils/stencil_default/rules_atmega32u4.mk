TARGET_MCU = atmega32u4

#helpers 
MODULE_SRCS += km0/base/utils.c

#peripheral wrappers
MODULE_SRCS += km0/device/atmega/system.c
MODULE_SRCS += km0/device/atmega/digitalIo.c
MODULE_SRCS += km0/device/atmega/usbIoCore.c
MODULE_SRCS += km0/device/atmega/dataMemory.c
MODULE_SRCS += km0/device/atmega/boardI2c.c

#keyboard core modules
MODULE_SRCS += km0/kernel/dataStorage.c
MODULE_SRCS += km0/kernel/configManager.c
MODULE_SRCS += km0/kernel/firmwareMetadata.c
MODULE_SRCS += km0/kernel/keyMappingDataValidator.c
MODULE_SRCS += km0/kernel/configuratorServant.c
MODULE_SRCS += km0/kernel/keyCodeTranslator.c
MODULE_SRCS += km0/kernel/keyActionRemapper.c
MODULE_SRCS += km0/kernel/keyboardCoreLogic.c
MODULE_SRCS += km0/kernel/keyboardMain.c

#matrix key scanner
ifneq ($(KL_USE_KEY_MATRIX),)
MODULE_SRCS += km0/scanner/keyScanner_basicMatrix.c
DEFINES += KS_USE_KEY_MATRIX
endif

#direct wired key scanner
ifneq ($(KL_USE_KEYS_DIRECT_WIRED),)
MODULE_SRCS += km0/scanner/keyScanner_directWired.c
DEFINES += KS_USE_KEYS_DIRECT_WIRED
endif

#encoder key scanner
ifneq ($(KL_USE_ENCODERS),)
MODULE_SRCS += km0/device/atmega/pinObserver.c
MODULE_SRCS += km0/scanner/keyScanner_encoders.c
DEFINES += KS_USE_ENCODERS
endif

#board leds
ifneq ($(KL_USE_BOARD_LEDS_PROMICRO_AVR),)
MODULE_SRCS += km0/device/boardIo.c
MODULE_SRCS += km0/device/atmega/boardIoImpl.c
DEFINES += KS_USE_BOARD_LEDS
DEFINES += KS_USE_BOARD_LEDS_PROMICRO_AVR
else
MODULE_SRCS += km0/device/boardIo.c
DEFINES += KS_USE_BOARD_LEDS
endif

#debug uart
ifneq ($(KL_USE_DEBUG_UART),)
MODULE_SRCS += km0/device/atmega/debugUart.c
DEFINES += KS_USE_DEBUG_UART
endif

#oled
ifneq ($(KL_USE_OLED_DISPLAY),)
MODULE_SRCS += km0/visualizer/oledDisplay_atmega/oledCore.c
MODULE_SRCS += km0/visualizer/oledDisplay_atmega/oledDisplay_default.c
DEFINES += KS_USE_OLED_DISPLAY
endif

#rgb lighting
ifneq ($(KL_USE_RGB_LIGHTING),)
MODULE_ASM_SRCS += km0/device/atmega/neoPixelCore.S
MODULE_SRCS += km0/device/atmega/serialLed.c
MODULE_SRCS += km0/visualizer/rgbLighting.c
DEFINES += KS_USE_RGB_LIGHTING
endif

#mouse sensor
ifneq ($(KL_USE_MOUSE_SENSOR_PAW3024),)
MODULE_SRCS += km0/pointer/halfDuplexSerial.c
MODULE_SRCS += km0/pointer/pointingDevice_opticalSensor_paw3204.c
DEFINES += KS_USE_MOUSE_SENSOR
endif

#status leds
ifneq ($(KL_USE_KEYBOARD_STATUS_LEDS),)
MODULE_SRCS += km0/visualizer/keyboardStatusLeds.c
DEFINES += KS_USE_KEYBOARD_STATUS_LEDS
endif

#unified keyboard
ifneq ($(KL_USE_GENERAL_KEYBOARD),)
MODULE_SRCS += km0/wrapper/generalKeyboard.c
PROJECT_STENCIL_SRCS += main.c
endif

#split keyboard
ifneq ($(KL_USE_SPLIT_KEYBOARD),)
MODULE_SRCS += km0/device/atmega/boardLink_singleWire.c
MODULE_SRCS += km0/wrapper/splitKeyboard.c
PROJECT_STENCIL_SRCS += main_split.c
endif

ifneq ($(KL_USE_CUSTOM_DATA),)
PROJECT_SRCS += customData.c
endif

