MODULE_SRCS += km0/device_io/rp2040/dio.c
PROJECT_PIO_ASM_SRCS += sw_dev0/swtxrx.pio
PROJECT_SRCS += sw_dev0/main2.c

$(OBJ_DIR)/$(PROJECT_CODE_DIR)/sw_dev0/main2.c.obj: \
 src/projects/dev/modules_dev/rp2040_pio/sw_dev0/main2.c \
 src/projects/dev/modules_dev/rp2040_pio/sw_dev0/swtxrx.pio.h \

