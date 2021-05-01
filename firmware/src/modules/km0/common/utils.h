#ifndef __UTILS_H__
#define __UTILS_H__

#include "km0/types.h"

void utils_debugShowBytes(uint8_t *buf, uint16_t len);
void utils_debugShowBytesDec(uint8_t *buf, uint16_t len);
void utils_copyBytes(uint8_t *dst, uint8_t *src, uint16_t len);
void utils_copyBitFlagsBuf(uint8_t *dstBuf, uint8_t dstOffset, uint8_t *srcBuf, uint8_t srcOffset, uint8_t count);
bool utils_compareBytes(uint8_t *arr1, uint8_t *arr2, uint16_t len);
void utils_copyStringToWideString(int16_t *dst, uint8_t *src, uint16_t len);
void utils_fillBytes(uint8_t *dst, uint8_t val, uint16_t len);
int utils_clamp(int val, int lo, int hi);

void utils_writeArrayedBitFlagsBit(uint8_t *bitFlagBytes, uint8_t flagIndex, bool state);
bool utils_readArrayedBitFlagsBit(uint8_t *bitFlagBytes, uint8_t flagIndex);

#define valueMinimum(a, b) (a < b ? a : b)

#define utils_max(a, b) (a > b ? a : b)

#endif
