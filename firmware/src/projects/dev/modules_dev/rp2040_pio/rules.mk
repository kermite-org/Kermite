TARGET_MCU = rp2040

#TARGET = sw_dev0
TARGET = neoPixel

ifeq ($(TARGET), sw_dev0)
MODULE_SRCS += km0/device_io/rp2040/dio.c
PROJECT_PIOASM_SRCS += sw_dev0/swtxrx.pio
PROJECT_SRCS += sw_dev0/main2.c
endif

ifeq ($(TARGET), neoPixel)
MODULE_SRCS += km0/device_io/rp2040/system.c
MODULE_SRCS += km0/device_io/rp2040/dio.c
MODULE_SRCS += km0/device_io/rp2040/boardLED.c
PROJECT_PIOASM_SRCS += neoPixel/neoPixelCore.pio
PROJECT_SRCS += neoPixel/main.c
endif
