TARGET_MCU = rp2040

MODULE_SRCS += km0/base/utils.c
MODULE_SRCS += km0/device/rp2040/system.c
MODULE_SRCS += km0/device/rp2040/digitalIo.c
MODULE_SRCS += km0/device/rp2040/debugUart.c
MODULE_SRCS += km0/device/rp2040/usbIoCore.c
MODULE_SRCS += km0/device/rp2040/dataMemory.c
MODULE_SRCS += km0/device/boardIo.c
MODULE_SRCS += km0/device/rp2040/boardIoImpl.c
MODULE_SRCS += km0/device/rp2040/boardIoImpl_rgbLed.c
MODULE_SRCS += km0/device/rp2040/serialLed.c
MODULE_SRCS += km0/device/rp2040/neoPixelCore.c
MODULE_SRCS += km0/device/rp2040/boardLink_singleWire.c
MODULE_PIOASM_SRCS += km0/device/rp2040/neoPixelCore.pio
MODULE_PIOASM_SRCS += km0/device/rp2040/singleWire4.pio

# MODULE_SRCS += km0/scanner/keyScanner_encoders.c

# PROJECT_SRCS += main_blink.c
PROJECT_SRCS += main_board_rgb_led.c
#PROJECT_SRCS += main_debug_uart.c
#PROJECT_SRCS += main_usbio.c
#PROJECT_SRCS += main_storage.c
#PROJECT_SRCS += main_singleWire.c
# PROJECT_SRCS += main_serialLed.c
#PROJECT_SRCS += main_rotary_encoder.c