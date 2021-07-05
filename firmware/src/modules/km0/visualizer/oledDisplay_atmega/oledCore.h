#pragma once

#include "km0/types.h"

void oledCore_initialize();
void oledCore_renderClear();
void oledCore_renderFullImage(__flash const uint32_t *pLineBuffers128);

void oledCore_setFontData(const uint8_t *fontDataPtr, int fontWidth, int fontLetterSpacing);
void oledCore_clearTexts();
void oledCore_putText(int caretY, int caretX, char *text);

void oledCore_renderFullTexts();
