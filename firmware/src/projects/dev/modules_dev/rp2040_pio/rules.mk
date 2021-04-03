TARGET_MCU = rp2040

TARGET = dev2

ifeq ($(TARGET), dev0)
MODULE_SRCS += km0/device_io/rp2040/dio.c
PROJECT_PIO_ASM_SRCS += sw_dev0/swtxrx.pio
PROJECT_SRCS += sw_dev0/main2.c
endif
