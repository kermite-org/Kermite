#include "oledCore.h"
#include "km0/common/bitOperations.h"
#include "km0/common/romData.h"
#include "km0/common/utils.h"
#include "km0/deviceIo/boardI2c.h"
#include <string.h>

//OLED描画処理モジュール
//RAM上にグラフィックスデータを持たない実装

//----------------------------------------------------------------------

static const uint8_t oledSlaveAddress = 0x3C;

static const uint8_t *fontDataPtr = NULL;
static int fontWidth = 0;
static int fontLetterSpacing = 0;

//文字バッファ, 横方向最大21文字, 横幅+文字間隔が6px以上のフォント配置に対応
static uint8_t lcdTextBuf[4][21] = { 0 };

//----------------------------------------------------------------------

static const uint8_t commandInitializationBytes[] ROM_DATA = {
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
  0x20, 0x00, //Memory Addressing Mode, Horizontal
  // 0x20, 0x01, //Memory Addressing Mode, Vertical
  0xAF //Display On
};

static const uint8_t commandResetPositionBytes[] ROM_DATA = {
  0x00,             //Control Byte
  0x22, 0x00, 0x03, //Page Start Address
  0x21, 0x00, 0x7F, //Column Start Address
};

static void sendRomData(const uint8_t *buf, int len) {
  boardI2c_procedural_startWrite(oledSlaveAddress);
  for (int i = 0; i < len; i++) {
    boardI2c_procedural_putByte(romData_readByte(buf + i));
  }
  boardI2c_procedural_endWrite();
}

void oledCore_initialize() {
  boardI2c_initialize();
  sendRomData(commandInitializationBytes, sizeof(commandInitializationBytes));
}

void oledCore_clear() {
  sendRomData(commandResetPositionBytes, sizeof(commandResetPositionBytes));
  boardI2c_procedural_startWrite(oledSlaveAddress);
  boardI2c_procedural_putByte(0x40);
  for (int i = 0; i < 512; i++) {
    boardI2c_procedural_putByte(0);
  }
  boardI2c_procedural_endWrite();
}

void oledCore_drawFullImage(const uint32_t *pLineBuffers128) {
  const uint8_t *pPixelsBuf512 = (const uint8_t *)pLineBuffers128;
  sendRomData(commandResetPositionBytes, sizeof(commandResetPositionBytes));
  boardI2c_procedural_startWrite(oledSlaveAddress);
  boardI2c_procedural_putByte(0x40);
  for (int i = 0; i < 4; i++) {
    for (int j = 0; j < 128; j++) {
      int index = j * 4 + i;
      boardI2c_procedural_putByte(romData_readByte(pPixelsBuf512 + index));
    }
  }
  boardI2c_procedural_endWrite();
}

void oledCore_setFontData(const uint8_t *_fontDataPtr, int _fontWidth, int _fontLetterSpacing) {
  fontDataPtr = _fontDataPtr,
  fontWidth = _fontWidth;
  fontLetterSpacing = _fontLetterSpacing;
}

void oledCore_clearTexts() {
  for (int row = 0; row < 4; row++) {
    for (int col = 0; col < 21; col++) {
      lcdTextBuf[row][col] = 0;
    }
  }
}

void oledCore_putText(int caretY, int caretX, char *text) {
  uint8_t i = 0;
  char chr;
  while ((chr = *text++) != '\0') {
    lcdTextBuf[caretY][caretX + i] = chr;
    i++;
  }
}

void oledCore_drawFullTexts() {
  if (fontDataPtr == NULL) {
    return;
  }
  sendRomData(commandResetPositionBytes, sizeof(commandResetPositionBytes));
  boardI2c_procedural_startWrite(oledSlaveAddress);
  boardI2c_procedural_putByte(0x40);

  int xStride = fontWidth + fontLetterSpacing;
  int numColumns = 128 / xStride;
  int rightPadding = 128 % xStride;

  for (int row = 0; row < 4; row++) {
    for (int col = 0; col < numColumns; col++) {
      uint8_t chr = lcdTextBuf[row][col];
      if (chr == 0) {
        //空文字
        for (int i = 0; i < fontWidth; i++) {
          boardI2c_procedural_putByte(0);
        }
      } else {
        //文字
        int fontIndexBase = (chr - 32) * fontWidth;
        for (int i = 0; i < fontWidth; i++) {
          boardI2c_procedural_putByte(romData_readByte(fontDataPtr + fontIndexBase + i));
        }
      }
      //文字間のスペーシング
      for (int i = 0; i < fontLetterSpacing; i++) {
        boardI2c_procedural_putByte(0);
      }
    }
    //画面右端余白
    for (int i = 0; i < rightPadding; i++) {
      boardI2c_procedural_putByte(0);
    }
  }
  boardI2c_procedural_endWrite();
}