TARGET_MCU = rp2040

MODULE_SRCS += km0/common/utils.c
MODULE_SRCS += km0/deviceIo/rp2040/system.c
MODULE_SRCS += km0/deviceIo/rp2040/dio.c
MODULE_SRCS += km0/deviceIo/rp2040/debugUart.c

PROJECT_SRCS += main_pseudo_open_drain.c
