WORKER = worker_rp2040

MODULE_SRCS += km0/device_io/rp2040/system.c
MODULE_SRCS += km0/device_io/rp2040/dio.c
MODULE_SRCS += km0/device_io/rp2040/boardIo.c
PROJECT_PIOASM_SRCS += neoPixelCore.pio
PROJECT_SRCS += main.c