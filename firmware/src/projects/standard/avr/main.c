#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/system.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_basicMatrix.h"
#include "km0/scanner/keyScanner_directWired.h"
#include "km0/wrapper/generalKeyboard.h"

typedef struct {
  uint8_t dataHeader[4];
  bool useBoardsLedsProMicroAvr;
  bool useDebugUart;
  bool useMatrixKeyScanner;
  bool useDirectWiredKeyScanner;
  uint8_t numMatrixColumns;
  uint8_t numMatrixRows;
  uint8_t numDirectWiredKeys;
  uint8_t keyScannerPins[32];
} KermiteKeyboardDefinitionData;

KermiteKeyboardDefinitionData defs = {
  .dataHeader = { 0x4B, 0x4D, 0x44, 0x46 }, //K,M,D,F
  .useBoardsLedsProMicroAvr = false,
  .useDebugUart = false,
  .useMatrixKeyScanner = false,
  .useDirectWiredKeyScanner = false,
  .numMatrixColumns = 0,
  .numMatrixRows = 0,
  .numDirectWiredKeys = 0,
  .keyScannerPins = { 0 }
};

int main() {
  if (defs.useBoardsLedsProMicroAvr) {
    boardIo_setupLeds_proMicroAvr();
  }
  if (defs.useDebugUart) {
    debugUart_initialize(38400);
  } else {
    system_setupFallbackStdout();
  }
  if (defs.useMatrixKeyScanner) {
    uint8_t numColumns = defs.numMatrixColumns;
    uint8_t numRows = defs.numMatrixRows;
    uint8_t *columnPins = defs.keyScannerPins;
    uint8_t *rowPins = defs.keyScannerPins + defs.numMatrixColumns;
    keyScanner_basicMatrix_initialize(numRows, numColumns, rowPins, columnPins, 0);
    keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
  }
  if (defs.useDirectWiredKeyScanner) {
    uint8_t numKeys = defs.numDirectWiredKeys;
    uint8_t *pins = defs.keyScannerPins;
    keyScanner_directWired_initialize(numKeys, pins, 0);
    keyboardMain_useKeyScanner(keyScanner_directWired_update);
  }
  generalKeyboard_start();
  return 0;
}
