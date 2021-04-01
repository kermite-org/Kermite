MODULE_SRCS += km0/device_io/rp2040/dio.c
PROJECT_PIO_ASM_SRCS += sw_dev1/swtxrx.pio
PROJECT_SRCS += sw_dev1/main3.c

$(OBJ_DIR)/$(PROJECT_CODE_DIR)/sw_dev1/main3.c.obj: \
 src/projects/dev/modules_dev/rp2040_pio/sw_dev1/main3.c \
 src/projects/dev/modules_dev/rp2040_pio/sw_dev1/swtxrx.pio.h \

