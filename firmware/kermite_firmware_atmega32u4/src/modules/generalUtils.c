#include "generalUtils.h"

#include <stdio.h>

void generalUtils_debugShowBytes(uint8_t *buf, uint16_t len) {
  for (uint16_t i = 0; i < len; i++) {
    printf("%02x ", buf[i]);
  }
  printf("\n");
}

void generalUtils_copyBytes(uint8_t *dst, uint8_t *src, uint16_t len) {
  for (uint16_t i = 0; i < len; i++) {
    dst[i] = src[i];
  }
}

bool generalUtils_compareBytes(uint8_t *arr1, uint8_t *arr2, uint16_t len) {
  for (size_t i = 0; i < len; i++) {
    if (arr1[i] != arr2[i]) {
      return false;
    }
  }
  return true;
}
