#include "oledCoreEx.h"
#include "km0/common/bitOperations.h"
#include "km0/common/configImport.h"
#include "km0/common/utils.h"
#include "km0/deviceIo/boardI2c.h"
#include <string.h>

#ifdef KM0_OLED_ORIENTATION_HORIZONTALVIEW_ROT180
const bool rot180_horizontalView = true;
#else
const bool rot180_horizontalView = false;
#endif

//----------------------------------------------------------------------

static const uint8_t commandInitializationBytes[] = {
  0x00,       //Control Byte
  0xAE,       //Display Off
  0xA8, 0x1F, //MUX Ratio
  0xD3, 0x00, //Display Offset
  0x40,       //Display Start Line
  0xA1,       //Segment re-map
  0xC8,       //COM Output Scan Direction
  0xDA, 0x02, //COM Pins hadware configuration
  // 0x81, 0x8F, //Contrast Control
  0x81, 0x3F, //Contrast Control
  0xA4,       //Disable Entire Display On
  0xA6,       //Normal Display
  0xD5, 0x80, //Osc Frequency
  0x8D, 0x14, //Enable charge pump regulator
  0x20, 0x01, //Memory Addressing Mode, Vertical
  0xAF        //Display On
};

static const uint8_t commandResetPositionBytes[] = {
  0x00,             //Control Byte
  0x22, 0x00, 0x03, //Page Start Address
  0x21, 0x00, 0x7F, //Column Start Address
};

static const uint8_t oledSlaveAddress = 0x3C;

static void oledInternal_initializeOled() {
  boardI2c_initialize();
  boardI2c_write(oledSlaveAddress, (uint8_t *)commandInitializationBytes, sizeof(commandInitializationBytes));
}

static uint8_t txbuf[513];

static void oledInternal_flushScreenPixels(uint8_t *pPixelsBuf512) {
  boardI2c_write(oledSlaveAddress, (uint8_t *)commandResetPositionBytes, sizeof(commandResetPositionBytes));
  boardI2c_procedural_startWrite(oledSlaveAddress);
  txbuf[0] = 0x40;
  memcpy(txbuf + 1, pPixelsBuf512, 512);
  boardI2c_write(oledSlaveAddress, txbuf, 513);
}

static void oledInternal_setRotate180(bool rot180) {
  if (!rot180) {
    txbuf[0] = 0;
    txbuf[1] = 0xA0; //Segment re-map
    txbuf[2] = 0xC0; //COM Output Scan Direction
  } else {
    txbuf[0] = 0;
    txbuf[1] = 0xA1; //Segment re-map
    txbuf[2] = 0xC8; //COM Output Scan Direction
  }
  boardI2c_write(oledSlaveAddress, txbuf, 3);
}

//----------------------------------------------------------------------

#define NumScanLine 128

static uint32_t scanLines[NumScanLine];

void oledCoreEx_initialize() {
  oledInternal_initializeOled();
  oledInternal_setRotate180(rot180_horizontalView);
}

void oledCoreEx_flushScreen() {
  oledInternal_flushScreenPixels((uint8_t *)scanLines);
}

//----------------------------------------------------------------------

void oledCoreEx_graphics_clear() {
  memset(scanLines, 0, NumScanLine * sizeof(uint32_t));
}

void oledCoreEx_graphics_putPixel(int x, int y) {
  bit_on(scanLines[x], y);
}

void oledCoreEx_graphics_drawLine(int x0, int y0, int x1, int y1) {
  int dx = x1 - x0;
  int dy = y1 - y0;
  int dd = utils_max(utils_abs(dx), utils_abs(dy));
  int ax = (dx << 8) / dd;
  int ay = (dy << 8) / dd;
  int px = x0 << 8;
  int py = y0 << 8;
  // __gr_putPixel(x0, y0);
  // __gr_putPixel(x1, y1);
  for (int i = 0; i < dd; i++) {
    oledCoreEx_graphics_putPixel(px >> 8, py >> 8);
    px += ax;
    py += ay;
  }
}

void oledCoreEx_graphics_drawFullImage(const uint32_t *pLineBuffers128) {
  for (int i = 0; i < 128; i++) {
    scanLines[i] = pLineBuffers128[i];
  }
}

static const uint8_t *fontDataPtr = NULL;
static int fontWidth = 0;
static int fontLetterSpacing = 0;

void oledCoreEx_graphics_setFontData(const uint8_t *_fontDataPtr, int _fontWidth, int _fontLetterSpacing) {
  fontDataPtr = _fontDataPtr,
  fontWidth = _fontWidth;
  fontLetterSpacing = _fontLetterSpacing;
}

static void drawChar(int caretY, int caretX, char chr) {
  int px = caretX * (fontWidth + fontLetterSpacing);
  int fontIndexBase = (chr - 32) * fontWidth;
  for (int i = 0; i < fontWidth; i++) {
    uint8_t *scanLineSplit4 = (uint8_t *)&scanLines[px + i];
    scanLineSplit4[caretY] = fontDataPtr[fontIndexBase + i];
  }
}

void oledCoreEx_graphics_drawText(int caretY, int caretX, char *text) {
  char chr;
  while ((chr = *text++) != '\0') {
    drawChar(caretY, caretX++, chr);
  }
}
