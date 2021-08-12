TARGET_MCU = rp2040

MODULE_SRCS += km0/base/utils.c
MODULE_SRCS += km0/device/rp2040/system.c
MODULE_SRCS += km0/device/rp2040/digitalIo.c
MODULE_SRCS += km0/device/rp2040/boardIo.c

PROJECT_SRCS += main.c