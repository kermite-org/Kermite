WORKER = worker_atmega32u4

MODULE_SRCS += km0/deviceIo/atmega/system.c
MODULE_SRCS += km0/deviceIo/atmega/dio.c
MODULE_SRCS += km0/deviceIo/atmega/boardIo.c
MODULE_SRCS += km0/deviceIo/atmega/debugUart.c
MODULE_SRCS += km0/deviceIo/atmega/dataMemory.c

PROJECT_SRCS += main_blink.c
#PROJECT_SRCS += main_dio.c
#PROJECT_SRCS += main_debugUart.c
#PROJECT_SRCS += main_dataMemory.c
