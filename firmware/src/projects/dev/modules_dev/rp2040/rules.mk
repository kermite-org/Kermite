TARGET_MCU = rp2040

MODULE_SRCS += km0/common/utils.c
MODULE_SRCS += km0/device_io/rp2040/system.c
MODULE_SRCS += km0/device_io/rp2040/dio.c
MODULE_SRCS += km0/device_io/rp2040/debugUart.c
MODULE_SRCS += km0/device_io/rp2040/usbioCore.c
MODULE_SRCS += km0/device_io/rp2040/dataMemory.c
MODULE_SRCS += km0/device_io/rp2040/boardLED_RGB.c
MODULE_SRCS += km0/device_io/rp2040/neoPixelCore.c
MODULE_PIOASM_SRCS += km0/device_io/rp2040/neoPixelCore.pio
MODULE_SRCS += km0/device_io/rp2040/singleWire4.c
MODULE_PIOASM_SRCS += km0/device_io/rp2040/singleWire4.pio
MODULE_SRCS += km0/device_io/rp2040/serialLED.c

PROJECT_SRCS += main_blink.c
#PROJECT_SRCS += main_debug_uart.c
#PROJECT_SRCS += main_usbio.c
#PROJECT_SRCS += main_storage.c
#PROJECT_SRCS += main_board_rgb_led.c
#PROJECT_SRCS += main_singleWire4.c
# PROJECT_SRCS += main_serialLED.c