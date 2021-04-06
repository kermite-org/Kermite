WORKER = worker_rp2040

MODULE_SRCS += km0/device_io/rp2040/dio.c
PROJECT_PIOASM_SRCS += swtxrx.pio
PROJECT_SRCS += main2.c