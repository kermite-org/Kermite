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
MODULE_SRCS += km0/device/rp2040/pinObserver.c
MODULE_SRCS += km0/scanner/keyScanner_encoders.c
DEFINES += KS_USE_ENCODERS
endif


REQ_NEOPIXEL_CORE =

#board leds
ifneq ($(KL_USE_BOARD_LEDS_PROMICRO_RP),)
	REQ_NEOPIXEL_CORE = 1
	MODULE_SRCS += km0/device/boardIo.c
	MODULE_SRCS += km0/device/rp2040/boardIoImpl_rgbLed.c
	DEFINES += KS_USE_BOARD_LEDS
	DEFINES += KS_USE_BOARD_LEDS_PROMICRO_RP
else
	ifneq ($(KL_USE_BOARD_LEDS_RPI_PICO),)
		MODULE_SRCS += km0/device/boardIo.c
		MODULE_SRCS += km0/device/rp2040/boardIoImpl.c
		DEFINES += KS_USE_BOARD_LEDS
		DEFINES += KS_USE_BOARD_LEDS_RPI_PICO
	else
		MODULE_SRCS += km0/device/boardIo.c
		DEFINES += KS_USE_BOARD_LEDS
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
DEFINES += KS_USE_OLED_DISPLAY
endif

#rgb lighting
ifneq ($(KL_USE_RGB_LIGHTING),)
REQ_NEOPIXEL_CORE = 1
MODULE_SRCS += km0/device/rp2040/serialLed.c
MODULE_SRCS += km0/visualizer/rgbLighting.c
DEFINES += KS_USE_RGB_LIGHTING
endif

#neopixel core
ifneq ($(REQ_NEOPIXEL_CORE),)
MODULE_SRCS += km0/device/rp2040/neoPixelCore.c
MODULE_PIOASM_SRCS += km0/device/rp2040/neoPixelCore.pio
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
MODULE_PIOASM_SRCS += km0/device/rp2040/singleWire4.pio
MODULE_SRCS += km0/device/rp2040/boardLink_singleWire.c
MODULE_SRCS += km0/wrapper/splitKeyboard.c
PROJECT_STENCIL_SRCS += main_split.c
endif

ifneq ($(KL_USE_CUSTOM_DATA),)
PROJECT_SRCS += customData.c
endif

