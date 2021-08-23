#pragma once

#include "km0/types.h"

void utils_debugShowBytes(uint8_t *buf, uint16_t len);
void utils_debugShowBytesDec(uint8_t *buf, uint16_t len);
void utils_copyBytes(uint8_t *dst, uint8_t *src, uint16_t len);
void utils_copyBitFlagsBuf(uint8_t *dstBuf, uint8_t dstOffset, uint8_t *srcBuf, uint8_t srcOffset, uint8_t count);
bool utils_compareBytes(uint8_t *arr1, uint8_t *arr2, uint16_t len);
void utils_copyString(char *dst, char *src, uint16_t maxLen);
void utils_copyStringToWideString(int16_t *dst, uint8_t *src, uint16_t len);
void utils_fillBytes(uint8_t *dst, uint8_t val, uint16_t len);
void utils_writeArrayedBitFlagsBit(uint8_t *bitFlagBytes, uint8_t flagIndex, bool state);
bool utils_readArrayedBitFlagsBit(uint8_t *bitFlagBytes, uint8_t flagIndex);
bool utils_checkPointerArrayIncludes(void **arr, int len, void *ptr);

#define valueMinimum(a, b) ((a) < (b) ? (a) : (b))

#define utils_abs(a) ((a) < 0 ? -(a) : (a))
#define utils_max(a, b) ((a) > (b) ? (a) : (b))

#define utils_clamp(val, lo, hi) ((val) < (lo) ? (lo) : ((val) > (hi) ? (hi) : (val)))

#define utils_inRange(val, lo, hi) (((lo) <= (val)) && ((val) <= (hi)))
