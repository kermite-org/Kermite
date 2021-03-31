# PROJECT_PIO_ASM_SRCS += hello_pio/hello.pio
# PROJECT_SRCS += hello_pio/hello.c

#PROJECT_SRCS += pseudo_open_drain/main.c

MODULE_SRCS += km0/device_io/rp2040/dio.c
PROJECT_PIO_ASM_SRCS += sw_dev0/swtxrx.pio
PROJECT_SRCS += sw_dev0/main.c

$(OBJ_DIR)/$(PROJECT_CODE_DIR)/sw_dev0/main.c.obj: \
 src/projects/dev/modules_dev/rp2040_pio/sw_dev0/main.c \
 src/projects/dev/modules_dev/rp2040_pio/sw_dev0/swtxrx.pio.h \

