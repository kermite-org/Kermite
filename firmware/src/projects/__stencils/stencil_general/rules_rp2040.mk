TARGET_MCU = rp2040

#helpers
MODULE_SRCS += km0/base/utils.c

#peripheral wrappers
MODULE_SRCS += km0/device/rp2040/system.c
MODULE_SRCS += km0/device/rp2040/digitalIo.c
MODULE_SRCS += km0/device/rp2040/usbIoCore.c
MODULE_SRCS += km0/device/rp2040/dataMemory.c

#keyboard core modules
MODULE_SRCS += km0/kernel/dataStorage.c
MODULE_SRCS += km0/kernel/configManager.c
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
MODULE_SRCS += km0/scanner/keyScanner_encoderBasic.c
DEFINES += KS_USE_ENCODERS
endif


REQ_NEOPIXEL_CORE =

#board leds
ifneq ($(KL_USE_BOARD_LEDS_PROMICRO_RP),)
	REQ_NEOPIXEL_CORE = 1
	MODULE_SRCS += km0/device/rp2040/boardIo_rgbLed.c
	DEFINES += KS_USE_BOARD_LEDS
	DEFINES += KS_USE_BOARD_LEDS_PROMICRO_RP
else
	ifneq ($(KL_USE_BOARD_LEDS_RPI_PICO),)
		MODULE_SRCS += km0/device/rp2040/boardIo.c
		DEFINES += KS_USE_BOARD_LEDS
		DEFINES += KS_USE_BOARD_LEDS_RPI_PICO
	else
		# MODULE_SRCS += km0/device/boardIo_dummy.c	//TODO: use this
		MODULE_SRCS += km0/device/rp2040/boardIo.c
	endif
endif

#debug uart
ifneq ($(KL_USE_DEBUG_UART),)
MODULE_SRCS += km0/device/rp2040/debugUart.c
DEFINES += KS_USE_DEBUG_UART
endif

#oled
ifneq ($(KL_USE_OLED_DISPLAY),)
MODULE_SRCS += km0/device/rp2040/boardI2c.c
MODULE_SRCS += km0/visualizer/oledDisplay_rp/oledCoreEx.c
MODULE_SRCS += km0/visualizer/oledDisplay_rp/oledDisplayEx_default.c
DEFINES += KS_USE_OLED
endif

#rgb lighting
ifneq ($(KL_USE_RGB_LIGHTING),)
REQ_NEOPIXEL_CORE = 1
MODULE_SRCS += km0/device/rp2040/serialLed.c
MODULE_SRCS += km0/visualizer/rgbLighting.c
DEFINES += KS_USE_RGB_LIGHTING
endif

ifneq ($(REQ_NEOPIXEL_CORE),)
MODULE_SRCS += km0/device/rp2040/neoPixelCore.c
MODULE_PIOASM_SRCS += km0/device/rp2040/neoPixelCore.pio
endif

ifneq ($(KL_USE_SPLIT_KEYBOARD),)
#split keyboard
MODULE_PIOASM_SRCS += km0/device/rp2040/singleWire4.pio
MODULE_SRCS += km0/device/rp2040/boardLink_singleWire.c
MODULE_SRCS += km0/wrapper/splitKeyboard.c
DEFINES += KS_USE_SPLIT_KEYBOARD
endif


ifneq ($(KL_USE_UNIFIED_KEYBOARD),)
#unified keyboard
MODULE_SRCS += km0/wrapper/generalKeyboard.c
DEFINES += KS_USE_UNIFIED_KEYBOARD
endif

PROJECT_STENCIL_SRCS += main.c