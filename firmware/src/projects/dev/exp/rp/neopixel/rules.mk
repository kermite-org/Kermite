TARGET_MCU = rp2040

MODULE_SRCS += km0/deviceIo/rp2040/system.c
MODULE_SRCS += km0/deviceIo/rp2040/digitalIo.c
MODULE_SRCS += km0/deviceIo/rp2040/boardIo.c
PROJECT_PIOASM_SRCS += neoPixelCore.pio
PROJECT_SRCS += main.c