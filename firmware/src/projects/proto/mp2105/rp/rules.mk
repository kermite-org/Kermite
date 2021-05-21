TARGET_MCU = rp2040

MODULE_SRCS += km0/common/utils.c
MODULE_SRCS += km0/deviceIo/rp2040/system.c
MODULE_SRCS += km0/deviceIo/rp2040/digitalIo.c
MODULE_SRCS += km0/deviceIo/rp2040/usbIoCore.c
MODULE_SRCS += km0/deviceIo/rp2040/dataMemory.c
MODULE_SRCS += km0/deviceIo/rp2040/debugUart.c
MODULE_SRCS += km0/deviceIo/rp2040/boardIo_rgbLed.c
MODULE_SRCS += km0/deviceIo/rp2040/boardI2c.c
MODULE_SRCS += km0/deviceIo/rp2040/serialLed.c
MODULE_SRCS += km0/deviceIo/rp2040/neoPixelCore.c
MODULE_PIOASM_SRCS += km0/deviceIo/rp2040/neoPixelCore.pio

MODULE_SRCS += km0/keyboard/dataStorage.c
MODULE_SRCS += km0/keyboard/configManager.c
MODULE_SRCS += km0/keyboard/keyMappingDataValidator.c
MODULE_SRCS += km0/keyboard/configuratorServant.c
MODULE_SRCS += km0/keyboard/keyCodeTranslator.c
MODULE_SRCS += km0/keyboard/keyActionRemapper.c
MODULE_SRCS += km0/keyboard/keyboardCoreLogic.c
MODULE_SRCS += km0/keyboard/keyboardMain.c
MODULE_SRCS += km0/keyboard/generalKeyboard.c

MODULE_SRCS += km0/keyboard/keyScanner_basicMatrix.c
MODULE_SRCS += km0/keyboard/keyScanner_encoderBasic.c

MODULE_SRCS += km0/visualizer/oledDisplay_rp/oledCoreEx.c
MODULE_SRCS += km0/visualizer/oledDisplay_rp/oledDisplayEx_default.c
MODULE_SRCS += km0/visualizer/rgbLighting.c

PROJECT_SRCS += main.c