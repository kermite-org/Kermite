WORKER = worker_rp2040

MODULE_SRCS += km0/deviceIo/rp2040/dio.c
PROJECT_PIOASM_SRCS += swtxrx.pio
PROJECT_SRCS += main3.c