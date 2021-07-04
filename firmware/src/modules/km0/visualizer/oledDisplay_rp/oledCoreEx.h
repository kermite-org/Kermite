#pragma once

#include "km0/types.h"

void oledCoreEx_initialize();
void oledCoreEx_flushScreen();

void oledCoreEx_graphics_clear();
void oledCoreEx_graphics_putPixel(int x, int y);
void oledCoreEx_graphics_drawLine(int x0, int y0, int x1, int y1);
void oledCoreEx_graphics_drawFullImage(const uint32_t *pLineBuffers128);

void oledCoreEx_graphics_setFontData(const uint8_t *fontDataPtr, int fontWidth, int fontLetterSpacing);
void oledCoreEx_graphics_drawText(int caretY, int caretX, char *text);
