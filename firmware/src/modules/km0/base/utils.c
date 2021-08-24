#include "utils.h"
#include "bitOperations.h"
#include <stdio.h>
#include <string.h>

void utils_debugShowBytes(uint8_t *buf, uint16_t len) {
  for (uint16_t i = 0; i < len; i++) {
    printf("%02X ", buf[i]);
  }
  printf("\n");
}

void utils_debugShowBytesDec(uint8_t *buf, uint16_t len) {
  for (uint16_t i = 0; i < len; i++) {
    printf("%d ", buf[i]);
  }
  printf("\n");
}

void utils_copyBytes(uint8_t *dst, uint8_t *src, uint16_t len) {
  for (uint16_t i = 0; i < len; i++) {
    dst[i] = src[i];
  }
}

void utils_copyBitFlagsBuf(uint8_t *dstBuf, uint8_t dstOffset, uint8_t *srcBuf, uint8_t srcOffset, uint8_t count) {
  for (uint8_t i = 0; i < count; i++) {
    uint8_t srcPos = srcOffset + i;
    uint8_t bi0 = srcPos >> 3;
    uint8_t fi0 = srcPos & 0b111;
    uint8_t dstPos = dstOffset + i;
    uint8_t bi1 = dstPos >> 3;
    uint8_t fi1 = dstPos & 0b111;
    uint8_t val = bit_read(srcBuf[bi0], fi0);
    bit_spec(dstBuf[bi1], fi1, val);
  }
}

bool utils_compareBytes(uint8_t *arr1, uint8_t *arr2, uint16_t len) {
  for (size_t i = 0; i < len; i++) {
    if (arr1[i] != arr2[i]) {
      return false;
    }
  }
  return true;
}

void utils_copyTextBytes(char *dst, char *src, uint16_t len) {
  for (size_t i = 0; i < len; i++) {
    dst[i] = src[i];
  }
}

void utils_copyStringToWideString(int16_t *dst, uint8_t *src, uint16_t len) {
  for (uint16_t i = 0; i < len; i++) {
    dst[i] = src[i];
  }
}

void utils_fillBytes(uint8_t *dst, uint8_t val, uint16_t len) {
  for (uint16_t i = 0; i < len; i++) {
    dst[i] = val;
  }
}

void utils_writeArrayedBitFlagsBit(uint8_t *bitFlagBytes, uint8_t flagIndex, bool state) {
  uint8_t byteIndex = flagIndex >> 3;
  uint8_t bitIndex = flagIndex & 7;
  bit_spec(bitFlagBytes[byteIndex], bitIndex, state);
}

bool utils_readArrayedBitFlagsBit(uint8_t *bitFlagBytes, uint8_t flagIndex) {
  uint8_t byteIndex = flagIndex >> 3;
  uint8_t bitIndex = flagIndex & 7;
  return bit_read(bitFlagBytes[byteIndex], bitIndex);
}

bool utils_checkPointerArrayIncludes(void **arr, int len, void *ptr) {
  for (int i = 0; i < len; i++) {
    if (arr[i] == ptr) {
      return true;
    }
  }
  return false;
}
