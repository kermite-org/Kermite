#ifndef __OLED_CORE_H__
#define __OLED_CORE_H__

#include "km0/types.h"

void oledCore_initialize();
void oledCore_flushScreen();

void oledCore_graphics_clear();
void oledCore_graphics_putPixel(int x, int y);
void oledCore_graphics_drawLine(int x0, int y0, int x1, int y1);
void oledCore_graphics_drawFullImage(const uint32_t *pLineBuffers128);

void oledCore_graphics_setFontData(const uint8_t *fontDataPtr, int fontWidth, int fontLetterSpacing);
void oledCore_graphics_drawText(int caretY, int caretX, char *text);

#endif