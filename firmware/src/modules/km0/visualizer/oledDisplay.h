#pragma once

#include "km0/types.h"

void oledDisplay_setCustomLogo(const uint32_t *logoData);
void oledDisplay_setCustomFont(const uint8_t *fontData, uint8_t fontWidth, uint8_t fontLetterSpacing);
void oledDisplay_initialize();
void oledDisplay_update();
