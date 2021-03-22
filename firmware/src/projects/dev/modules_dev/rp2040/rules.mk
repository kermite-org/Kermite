TARGET_MCU = rp2040

MODULE_SRCS += km0/device_io/rp2040/system.c
MODULE_SRCS += km0/device_io/rp2040/dio.c
MODULE_SRCS += km0/device_io/rp2040/debugUart.c
MODULE_SRCS += km0/device_io/rp2040/usbioCore.c
MODULE_SRCS += km0/device_io/rp2040/dataMemory.c
MODULE_SRCS += km0/device_io/rp2040/boardLED_RGB.c

# PROJECT_SRCS += main_blink.c
# PROJECT_SRCS += main_debug_uart.c
# PROJECT_SRCS += main_usbio.c
#PROJECT_SRCS += main_storage.c
PROJECT_SRCS += main_board_rgb_led.c
