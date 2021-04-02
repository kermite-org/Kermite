#TARGET = dev0
TARGET = dev2

ifeq ($(TARGET), dev0)
MODULE_SRCS += km0/device_io/rp2040/dio.c
PROJECT_PIO_ASM_SRCS += sw_dev0/swtxrx.pio
PROJECT_SRCS += sw_dev0/main4.c

endif

ifeq ($(TARGET), dev2)

MODULE_SRCS += km0/common/utils.c
MODULE_SRCS += km0/device_io/rp2040/dio.c
MODULE_SRCS += km0/device_io/rp2040/system.c
MODULE_SRCS += km0/device_io/rp2040/debugUart.c

PROJECT_PIO_ASM_SRCS += sw_dev2/singleWire4.pio
PROJECT_SRCS += sw_dev2/singleWire4.c
PROJECT_SRCS += sw_dev2/main4.c

endif

