#ifndef __MCU_CONFIG_H__
#define __MCU_CONFIG_H__

#if __has_include("config.h")
#include "config.h"
#endif

#define PICO_BOOT_STAGE2_CHOOSE_W25Q080 1
#define PICO_FLASH_SPI_CLKDIV 2

// PICO_FLASH_SIZE_BYTES
// 現状デフォルトのリンカスクリプト(ROM2M,RAM256K)を使用しておりここで値を設定しても反映されない

#if defined KM0_RP_TARGET_BOARD_RPI_PICO

// #define PICO_FLASH_SIZE_BYTES (2 * 1024 * 1024)

// Drive high to force power supply into PWM mode (lower ripple on 3V3 at light loads)
// #define PICO_SMPS_MODE_PIN 23

#define PICO_FLOAT_SUPPORT_ROM_V1 1
#define PICO_DOUBLE_SUPPORT_ROM_V1 1

#elif defined KM0_RP_TARGET_BOARD_PRO_MICRO_RP2040

// #define PICO_FLASH_SIZE_BYTES (16 * 1024 * 1024)
#define PICO_FLOAT_SUPPORT_ROM_V1 0
#define PICO_DOUBLE_SUPPORT_ROM_V1 0

#elif defined KM0_RP_TARGET_BOARD_QT_PY_RP2040

// #define PICO_FLASH_SIZE_BYTES (8 * 1024 * 1024)
#define PICO_FLOAT_SUPPORT_ROM_V1 0
#define PICO_DOUBLE_SUPPORT_ROM_V1 0

#else
// #error KM0_RP_TARGET_BOARD_* is not defined
//fallback
#define PICO_FLOAT_SUPPORT_ROM_V1 0
#define PICO_DOUBLE_SUPPORT_ROM_V1 0

#endif

#endif
