TARGET_MCU = rp2040

MODULE_SRCS += km0/common/utils.c
MODULE_SRCS += km0/deviceIo/rp2040/system.c
MODULE_SRCS += km0/deviceIo/rp2040/digitalIo.c
MODULE_SRCS += km0/deviceIo/rp2040/debugUart.c
MODULE_SRCS += km0/deviceIo/rp2040/usbIoCore.c
MODULE_SRCS += km0/deviceIo/rp2040/dataMemory.c
MODULE_SRCS += km0/deviceIo/rp2040/boardIo_rgbLed.c
MODULE_SRCS += km0/deviceIo/rp2040/neoPixelCore.c
MODULE_PIOASM_SRCS += km0/deviceIo/rp2040/neoPixelCore.pio
MODULE_SRCS += km0/deviceIo/rp2040/boardLink_singleWire.c
MODULE_PIOASM_SRCS += km0/deviceIo/rp2040/singleWire4.pio
MODULE_SRCS += km0/deviceIo/rp2040/serialLed.c
MODULE_SRCS += km0/keyboard/keyScanner_encoderBasic.c

PROJECT_SRCS += main_blink.c
#PROJECT_SRCS += main_debug_uart.c
#PROJECT_SRCS += main_usbio.c
#PROJECT_SRCS += main_storage.c
#PROJECT_SRCS += main_board_rgb_led.c
#PROJECT_SRCS += main_singleWire.c
# PROJECT_SRCS += main_serialLed.c
#PROJECT_SRCS += main_rotary_encoder.c