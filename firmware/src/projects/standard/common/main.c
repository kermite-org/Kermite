#include "km0/base/utils.h"
#include "km0/device/boardIo.h"
#include "km0/device/boardIoImpl.h"
#include "km0/device/debugUart.h"
#include "km0/device/system.h"
#include "km0/kernel/firmwareMetadata.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_basicMatrix.h"
#include "km0/scanner/keyScanner_directWired.h"
#include "km0/scanner/keyScanner_encoders.h"
#include "km0/visualizer/oledDisplay.h"
#include "km0/visualizer/rgbLighting.h"
#include "km0/wrapper/generalKeyboard.h"

enum {
  BoardType_None = 0,
  BoardType_ChipAtMega32U4 = 1,
  BoardType_ProMicro = 2,
  BoardType_ChipRP2040 = 3,
  BoardType_ProMicroRP2040 = 4,
  BoardType_RpiPico = 5
};
typedef struct {
  uint8_t dataHeader[5];
  uint8_t boardType;
  bool useBoardLeds;
  bool useDebugUart;
  bool useMatrixKeyScanner;
  bool useDirectWiredKeyScanner;
  bool useEncoder;
  bool useRgbLighting;
  bool useOledDisplay;
  uint8_t numMatrixRows;
  uint8_t numMatrixColumns;
  uint8_t numDirectWiredKeys;
  uint8_t numEncoders;
  uint8_t keyScannerPins[32];
  uint8_t rgbLightingPin;
  uint8_t rgbLightingNumLeds;
} KermiteKeyboardDefinitionData;

KermiteKeyboardDefinitionData defs = {
  .dataHeader = { '$', 'K', 'M', 'D', 'F' },
  .boardType = 0,
  .useBoardLeds = false,
  .useDebugUart = false,
  .useMatrixKeyScanner = false,
  .useDirectWiredKeyScanner = false,
  .useEncoder = false,
  .useRgbLighting = false,
  .useOledDisplay = false,
  .numMatrixRows = 0,
  .numMatrixColumns = 0,
  .numDirectWiredKeys = 0,
  .numEncoders = 0,
  .keyScannerPins = { 0 },
  .rgbLightingPin = 0,
  .rgbLightingNumLeds = 0,
};

static EncoderConfig encoderConfigs[3] = { 0 };

int main() {
  if (defs.useBoardLeds) {
    if (defs.boardType == BoardType_ProMicro) {
      boardIoImpl_setupLeds_proMicroAvr();
    }
    if (defs.boardType == BoardType_ProMicroRP2040) {
      boardIoImpl_setupLeds_proMicroRp();
    }
    if (defs.boardType == BoardType_RpiPico) {
      boardIoImpl_setupLeds_rpiPico();
    }
  }
  if (defs.useDebugUart) {
    debugUart_initialize(38400);
  } else {
    system_setupFallbackStdout();
  }
  if (defs.useRgbLighting) {
    rgbLighting_preConfigure();
    rgbLighting_initialize(defs.rgbLightingPin);
    rgbLighting_setNumLeds(defs.rgbLightingNumLeds);
    keyboardMain_useRgbLightingModule(rgbLighting_update);
  }
  if (defs.useOledDisplay) {
    oledDisplay_initialize();
    keyboardMain_useOledDisplayModule(oledDisplay_update);
  }
  uint pinsOffset = 0;
  uint8_t scanIndexBase = 0;
  if (defs.useMatrixKeyScanner) {
    uint8_t numRows = defs.numMatrixRows;
    uint8_t numColumns = defs.numMatrixColumns;
    uint8_t *rowPins = defs.keyScannerPins;
    uint8_t *columnPins = defs.keyScannerPins + defs.numMatrixRows;
    keyScanner_basicMatrix_initialize(numRows, numColumns, rowPins, columnPins, scanIndexBase);
    keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
    pinsOffset += numRows + numColumns;
    scanIndexBase += numRows * numColumns;
  }
  if (defs.useDirectWiredKeyScanner) {
    uint8_t numKeys = defs.numDirectWiredKeys;
    uint8_t *pins = defs.keyScannerPins + pinsOffset;
    keyScanner_directWired_initialize(numKeys, pins, scanIndexBase);
    keyboardMain_useKeyScanner(keyScanner_directWired_update);
    pinsOffset += numKeys;
    scanIndexBase += numKeys;
  }
  if (defs.useEncoder) {
    uint8_t numEncoders = defs.numEncoders;
    for (int i = 0; i < numEncoders; i++) {
      EncoderConfig *config = &encoderConfigs[i];
      config->pinA = defs.keyScannerPins[pinsOffset + i * 2];
      config->pinB = defs.keyScannerPins[pinsOffset + i * 2 + 1];
      config->scanIndexBase = scanIndexBase + i * 2;
    }
    keyboardMain_useKeyScanner(keyScanner_encoders_update);
    keyScanner_encoders_initialize(numEncoders, encoderConfigs);
    pinsOffset += numEncoders * 2;
    scanIndexBase += numEncoders * 2;
  }
  generalKeyboard_start();
  return 0;
}
