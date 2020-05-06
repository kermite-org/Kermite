#ifndef __GENERAL_UTILS_H__
#define __GENERAL_UTILS_H__

#include "types.h"
void generalUtils_debugShowBytes(uint8_t *buf, uint16_t len);

void generalUtils_copyBytes(uint8_t *dst, uint8_t *src, uint16_t len);

#endif
