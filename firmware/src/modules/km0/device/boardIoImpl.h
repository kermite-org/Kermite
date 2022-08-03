#pragma once
#include "km0/types.h"

void boardIoImpl_setupLeds(int8_t pin1, int8_t pin2, bool invert) __attribute__((weak));
void boardIoImpl_setupLedsRgb(int8_t pin_led, int8_t pin_led_power) __attribute__((weak));

void boardIoImpl_setupLeds_proMicroRp() __attribute__((weak));
void boardIoImpl_setupLeds_rpiPico() __attribute__((weak));
void boardIoImpl_setupLeds_qtPyRp() __attribute__((weak));
void boardIoImpl_setupLeds_tiny2040() __attribute__((weak));
void boardIoImpl_setupLeds_seeedXiaoRp2040() __attribute__((weak));