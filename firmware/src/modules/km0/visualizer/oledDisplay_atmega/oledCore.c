#include "oledCore.h"
#include "km0/base/romData.h"
#include "km0/base/utils.h"
#include "km0/device/boardI2c.h"
#include "km0/device/system.h"
#include <stdio.h>

//OLED描画処理モジュール
//RAM上にグラフィックスデータを持たない実装

#ifdef KM0_OLED__ORIENTATION_HORIZONTALVIEW_ROT180
const bool rot180_horizontalView = true;
#else
const bool rot180_horizontalView = false;
#endif

#define bit_on_32(p, b) (p) |= (1UL << (b))
#define bit_is_on_32(p, b) ((p) >> (b)&1) > 0

//----------------------------------------------------------------------

static const uint8_t oledSlaveAddress = 0x3C;

static const uint8_t *fontDataPtr = NULL;
static int fontWidth = 0;
static int fontLetterSpacing = 0;

//文字バッファ, 横方向最大21文字, 横幅+文字間隔が6px以上のフォント配置に対応
static uint8_t lcdTextBuf[4][21] = { 0 };

static uint32_t lcdTextChangedFlags[4] = { 0 };

//----------------------------------------------------------------------

__flash static const uint8_t commandInitializationBytes[] = {
  0x00,       //Control Byte
  0xAE,       //Display Off
  0xA8, 0x1F, //MUX Ratio
  0xD3, 0x00, //Display Offset
  0x40,       //Display Start Line
  0xA1,       //Segment re-map
  // 0xA0, //Segment re-map
  0xC8, //COM Output Scan Direction
  // 0xC0, //COM Output Scan Direction
  0xDA, 0x02, //COM Pins hadware configuration
  // 0x81, 0x8F, //Contrast Control
  0x81, 0x3F, //Contrast Control
  0xA4,       //Disable Entire Display On
  0xA6,       //Normal Display
  0xD5, 0x80, //Osc Frequency
  0x8D, 0x14, //Enable charge pump regulator
  // 0x20, 0x00, //Memory Addressing Mode, Horizontal
  // 0x20, 0x01, //Memory Addressing Mode, Vertical
  0x20, 0x02, //Memory Addressing Mode, Page
  0xAF        //Display On
};

static void sendRomData(__flash const uint8_t *buf, int len) {
  boardI2c_procedural_startWrite(oledSlaveAddress);
  for (int i = 0; i < len; i++) {
    boardI2c_procedural_putByte(buf[i]);
  }
  boardI2c_procedural_endWrite();
}

static uint8_t cmdbuf[4];

static void setRotate180(bool rot180) {
  if (!rot180) {
    cmdbuf[0] = 0;
    cmdbuf[1] = 0xA0; //Segment re-map
    cmdbuf[2] = 0xC0; //COM Output Scan Direction
  } else {
    cmdbuf[0] = 0;
    cmdbuf[1] = 0xA1; //Segment re-map
    cmdbuf[2] = 0xC8; //COM Output Scan Direction
  }
  boardI2c_write(oledSlaveAddress, cmdbuf, 3);
}

static void setGdRamAddress(uint8_t page, uint8_t column) {
  boardI2c_procedural_startWrite(oledSlaveAddress);
  boardI2c_procedural_putByte(0x00);
  boardI2c_procedural_putByte(0xB0 | page);                 //page
  boardI2c_procedural_putByte(column & 0x0F);               //column lo
  boardI2c_procedural_putByte(0x10 | (column >> 4 & 0x0F)); //column hi
  boardI2c_procedural_endWrite();
}

//----------------------------------------------------------------------

void oledCore_initialize() {
  boardI2c_initialize();
  sendRomData(commandInitializationBytes, sizeof(commandInitializationBytes));
  setRotate180(rot180_horizontalView);
}

void oledCore_renderClear() {
  for (int i = 0; i < 4; i++) {
    setGdRamAddress(i, 0);
    boardI2c_procedural_startWrite(oledSlaveAddress);
    boardI2c_procedural_putByte(0x40);
    for (int i = 0; i < 128; i++) {
      boardI2c_procedural_putByte(0);
    }
    boardI2c_procedural_endWrite();
  }
}

void oledCore_renderFullImage(__flash const uint32_t *pLineBuffers128) {
  __flash const uint8_t *pPixelsBuf512 = (__flash const uint8_t *)pLineBuffers128;
  for (int i = 0; i < 4; i++) {
    setGdRamAddress(i, 0);
    boardI2c_procedural_startWrite(oledSlaveAddress);
    boardI2c_procedural_putByte(0x40);
    for (int j = 0; j < 128; j++) {
      int index = j * 4 + i;
      uint8_t data = pPixelsBuf512[index];
      boardI2c_procedural_putByte(data);
    }
    boardI2c_procedural_endWrite();
  }
}

void oledCore_setFontData(const uint8_t *_fontDataPtr, int _fontWidth, int _fontLetterSpacing) {
  fontDataPtr = _fontDataPtr,
  fontWidth = _fontWidth;
  fontLetterSpacing = _fontLetterSpacing;
}

void oledCore_clearTexts() {
  for (int row = 0; row < 4; row++) {
    for (int col = 0; col < 21; col++) {
      if (lcdTextBuf[row][col] != 0) {
        lcdTextBuf[row][col] = 0;
        bit_on_32(lcdTextChangedFlags[row], col);
      }
    }
  }
}

void oledCore_putText(int caretY, int caretX, char *text) {
  uint8_t yi = caretY;
  uint8_t xi = caretX;
  char chr;
  while ((chr = *text++) != '\0') {
    if (chr != lcdTextBuf[yi][xi]) {
      lcdTextBuf[yi][xi] = chr;
      bit_on_32(lcdTextChangedFlags[yi], xi);
    }
    xi++;
  }
}

static void renderCharAt(int caretY, int caretX, char chr) {
  uint8_t xi = caretX * (fontWidth + fontLetterSpacing);
  setGdRamAddress(caretY, xi);
  boardI2c_procedural_startWrite(oledSlaveAddress);
  boardI2c_procedural_putByte(0x40);
  int fontIndexBase = (chr == 0) ? 0 : ((chr - 32) * fontWidth);
  for (int i = 0; i < fontWidth; i++) {
    uint8_t data = romData_readByte(fontDataPtr + fontIndexBase + i);
    boardI2c_procedural_putByte(data);
  }
  boardI2c_procedural_endWrite();
}

void oledCore_renderFullTexts() {
  int xStride = fontWidth + fontLetterSpacing;
  int numColumns = 128 / xStride;
  for (int row = 0; row < 4; row++) {
    for (int col = 0; col < numColumns; col++) {
      bool changed = bit_is_on_32(lcdTextChangedFlags[row], col);
      if (changed) {
        uint8_t chr = lcdTextBuf[row][col];
        renderCharAt(row, col, chr);
      }
    }
  }
  for (int i = 0; i < 4; i++) {
    lcdTextChangedFlags[i] = 0;
  }
}