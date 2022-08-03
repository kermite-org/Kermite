#include "km0/base/utils.h"
#include "km0/device/boardIo.h"
#include "km0/device/boardIoImpl.h"
#include "km0/device/boardLink.h"
#include "km0/device/debugUart.h"
#include "km0/device/system.h"
#include "km0/kernel/firmwareMetadata.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_basicMatrix.h"
#include "km0/scanner/keyScanner_directWired.h"
#include "km0/scanner/keyScanner_encoders.h"
#include "km0/wrapper/splitKeyboard.h"

#ifdef KS_USE_OLED_DISPLAY
#include "km0/visualizer/oledDisplay.h"
#endif

#ifdef KS_USE_RGB_LIGHTING
#include "km0/visualizer/rgbLighting.h"
#endif

#include "standard_firmare_defs.h"

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
  uint8_t numMatrixRowsRight;
  uint8_t numMatrixColumnsRight;
  uint8_t numDirectWiredKeys;
  uint8_t numDirectWiredKeysRight;
  uint8_t numEncoder;      //0 or 1
  uint8_t numEncoderRight; //0 or 1
  uint8_t keyScannerPins[32];
  uint8_t rgbLightingPin;
  uint8_t rgbLightingNumLeds;
  uint8_t rgbLightingNumLedsRight;
  uint8_t singleWireSignalPin;
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
  .numMatrixRowsRight = 0,
  .numMatrixColumnsRight = 0,
  .numDirectWiredKeys = 0,
  .numDirectWiredKeysRight = 0,
  .numEncoder = 0,
  .numEncoderRight = 0,
  .keyScannerPins = { 0 },
  .rgbLightingPin = 0,
  .rgbLightingNumLeds = 0,
  .rgbLightingNumLedsRight = 0,
  .singleWireSignalPin = 0,
};

static EncoderConfig encoderConfigs[1] = { { .pinA = 0, .pinB = 0, .scanIndexBase = 0 } };
static EncoderConfig encoderConfigsR[1] = { { .pinA = 0, .pinB = 0, .scanIndexBase = 0 } };

static void setupBoard(int8_t side) {

  uint8_t *pins = defs.keyScannerPins;

  uint8_t numRows = defs.numMatrixRows;
  uint8_t numColumns = defs.numMatrixColumns;
  uint8_t numRowsR = defs.numMatrixRowsRight;
  uint8_t numColumnsR = defs.numMatrixColumnsRight;
  uint8_t numDwKeys = defs.numDirectWiredKeys;
  uint8_t numDwKeysR = defs.numDirectWiredKeysRight;
  uint8_t numEncodersPins = defs.numEncoder * 2;
  uint8_t numEncodersPinsR = defs.numEncoderRight * 2;

  uint8_t *rowPins = &pins[0];
  uint8_t *columnPins = &pins[numRows];
  uint8_t *rowPinsR = &pins[numRows + numColumns];
  uint8_t *columnPinsR = &pins[numRows + numColumns + numRowsR];
  pins += numRowsR + numColumns + numRowsR + numColumnsR;

  uint8_t *dwPins = &pins[0];
  uint8_t *dwPinsR = &pins[numDwKeys];
  pins += numDwKeys + numDwKeysR;

  uint8_t *encoderPins = &pins[0];
  uint8_t *encoderPinsR = &pins[numEncodersPins];
  pins += numEncodersPins + numEncodersPinsR;

  uint8_t numScanSlotsLeft = (numRows * numColumns) + numDwKeys + numEncodersPins;
  uint8_t numScanSlotsRight = (numRowsR * numColumnsR) + numDwKeysR + numEncodersPinsR;
  splitKeyboard_setNumScanSlots(numScanSlotsLeft, numScanSlotsRight);

  uint8_t scanIndexBaseL = 0;
  uint8_t scanIndexBaseR = numScanSlotsLeft;

  if (defs.useMatrixKeyScanner) {
    if (side == 0 && numRows > 0 && numColumns > 0) {
      keyScanner_basicMatrix_initialize(numRows, numColumns, rowPins, columnPins, scanIndexBaseL);
      keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
      scanIndexBaseL += (numRows * numColumns);
    }
    if (side == 1 && numRowsR > 0 && numColumnsR > 0) {
      keyScanner_basicMatrix_initialize(numRowsR, numColumnsR, rowPinsR, columnPinsR, scanIndexBaseR);
      keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
      scanIndexBaseR += (numRowsR * numColumnsR);
    }
  }
  if (defs.useDirectWiredKeyScanner) {
    if (side == 0 && numDwKeys > 0) {
      keyScanner_directWired_initialize(numDwKeys, dwPins, scanIndexBaseL);
      keyboardMain_useKeyScanner(keyScanner_directWired_update);
      scanIndexBaseL += numDwKeys;
    }
    if (side == 1 && numDwKeysR > 0) {
      keyScanner_directWired_initialize(numDwKeysR, dwPinsR, scanIndexBaseR);
      keyboardMain_useKeyScanner(keyScanner_directWired_update);
      scanIndexBaseR += numDwKeysR;
    }
  }
  if (defs.useEncoder) {
    if (side == 0 && defs.numEncoder == 1) {
      EncoderConfig *config = &encoderConfigs[0];
      config->pinA = encoderPins[0];
      config->pinB = encoderPins[1];
      config->scanIndexBase = scanIndexBaseL;
      keyScanner_encoders_initialize(1, encoderConfigs);
      keyboardMain_useKeyScanner(keyScanner_encoders_update);
      scanIndexBaseL += 2;
    }
    if (side == 1 && defs.numEncoderRight == 1) {
      EncoderConfig *config = &encoderConfigsR[0];
      config->pinA = encoderPinsR[0];
      config->pinB = encoderPinsR[1];
      config->scanIndexBase = scanIndexBaseR;
      keyScanner_encoders_initialize(1, encoderConfigs);
      keyboardMain_useKeyScanner(keyScanner_encoders_update);
      scanIndexBaseR += 2;
    }
  }
#ifdef KS_USE_RGB_LIGHTING
  if (defs.useRgbLighting) {
    if (side == 0) {
      rgbLighting_setNumLeds(defs.rgbLightingNumLeds);
    } else {
      rgbLighting_setNumLeds(defs.rgbLightingNumLedsRight);
    }
  }
#endif
}

int main() {
  if (defs.useBoardLeds) {
    if (defs.boardType == BoardType_ProMicroRP2040 && boardIoImpl_setupLeds_proMicroRp) {
      boardIoImpl_setupLeds_proMicroRp();
    }
    if (defs.boardType == BoardType_RpiPico && boardIoImpl_setupLeds_rpiPico) {
      boardIoImpl_setupLeds_rpiPico();
    }
    configManager_setParameterExposeFlagsForBoardLeds();
  }
  if (defs.useDebugUart) {
    debugUart_initialize(38400);
  } else {
    system_setupFallbackStdout();
  }

#ifdef KS_USE_OLED_DISPLAY
  if (defs.useOledDisplay) {
    oledDisplay_initialize();
    keyboardMain_useOledDisplayModule(oledDisplay_update);
  }
#endif

#ifdef KS_USE_RGB_LIGHTING
  if (defs.useRgbLighting) {
    rgbLighting_preConfigure();
    rgbLighting_initialize(defs.rgbLightingPin);
    keyboardMain_useRgbLightingModule(rgbLighting_update);
  }
#endif

  boardLink_singleWire_setSignalPin(defs.singleWireSignalPin);

  splitKeyboard_setBoardConfigCallback(setupBoard);
  splitKeyboard_start();

  return 0;
}
