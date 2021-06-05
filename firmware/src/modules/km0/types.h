#ifndef __TYPES_H__
#define __TYPES_H__

#include <stdbool.h>
#include <stdint.h>

#if defined(KERMITE_TARGET_MCU_RP2040) && !defined(__flash)
#define __flash
#endif

typedef unsigned int uint;

#endif