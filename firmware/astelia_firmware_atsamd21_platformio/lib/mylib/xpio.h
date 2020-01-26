#ifndef __PIO_H__
#define __PIO_H__

#include <stdint.h>
#include <stdbool.h>

void pio_setPinModeOutput(uint32_t pin);
void pio_setPinModeInputPullUp(uint32_t pin);
int pio_getPinLevel(uint32_t pin);
void pio_setPinLevel(uint32_t pin, bool level);
void pio_setPinLevelHigh(uint32_t pin);
void pio_setPinLevelLow(uint32_t pin);

#endif