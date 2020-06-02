#ifndef __GENERAL_UTILS_H__
#define __GENERAL_UTILS_H__

#include "types.h"

void generalUtils_debugShowBytes(uint8_t *buf, uint16_t len);

void generalUtils_copyBytes(uint8_t *dst, uint8_t *src, uint16_t len);

void generalUtils_copyBitFlagsBuf(uint8_t *dstBuf, uint8_t dstOffset, uint8_t *srcBuf, uint8_t srcOffset, uint8_t count);

bool generalUtils_compareBytes(uint8_t *arr1, uint8_t *arr2, uint16_t len);

#endif
