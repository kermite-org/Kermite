TARGET_MCU = rp2040

MODULE_SRCS += km0/deviceIo/rp2040/digitalIo.c
PROJECT_PIOASM_SRCS += swtxrx.pio
PROJECT_SRCS += main3.c