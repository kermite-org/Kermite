#include "km0/base/utils.h"
#include "km0/device/boardIo.h"
#include "km0/device/boardIoImpl.h"
#include "km0/device/debugUart.h"
#include "km0/device/system.h"
#include "km0/kernel/firmwareConfigurationData.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_basicMatrix.h"
#include "km0/scanner/keyScanner_directWired.h"
#include "km0/scanner/keyScanner_encoders.h"
#include "km0/visualizer/oledDisplay.h"
#include "km0/visualizer/rgbLighting.h"
#include "km0/wrapper/generalKeyboard.h"
typedef struct {
  uint8_t dataHeader[5];
  bool useBoardLedsProMicroAvr;
  bool useBoardLedsProMicroRp;
  bool useBoardLedsRpiPico;
  bool useDebugUart;
  bool useMatrixKeyScanner;
  bool useDirectWiredKeyScanner;
  bool useEncoder;
  bool useRgbLighting;
  bool useOledDisplay;
  uint8_t numMatrixRows;
  uint8_t numMatrixColumns;
  uint8_t numDirectWiredKeys;
  uint8_t keyScannerPins[32];
  uint8_t rgbLightingPin;
  uint8_t rgbLightingNumLeds;
} KermiteKeyboardDefinitionData;

KermiteKeyboardDefinitionData defs = {
  .dataHeader = { '$', 'K', 'M', 'D', 'F' },
  .useBoardLedsProMicroAvr = false,
  .useBoardLedsProMicroRp = false,
  .useBoardLedsRpiPico = false,
  .useDebugUart = false,
  .useMatrixKeyScanner = false,
  .useDirectWiredKeyScanner = false,
  .useEncoder = false,
  .useRgbLighting = false,
  .useOledDisplay = false,
  .numMatrixRows = 0,
  .numMatrixColumns = 0,
  .numDirectWiredKeys = 0,
  .keyScannerPins = { 0 },
  .rgbLightingPin = 0,
  .rgbLightingNumLeds = 0,
};

static EncoderConfig encoderConfigs[1] = { { .pinA = 0, .pinB = 0, .scanIndexBase = 0 } };

int main() {
  if (defs.useBoardLedsProMicroAvr) {
    boardIoImpl_setupLeds_proMicroAvr();
  }
  if (defs.useBoardLedsProMicroRp) {
    boardIoImpl_setupLeds_proMicroRp();
  }
  if (defs.useBoardLedsRpiPico) {
    boardIoImpl_setupLeds_rpiPico();
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
    EncoderConfig *config = &encoderConfigs[0];
    config->pinA = defs.keyScannerPins[pinsOffset];
    config->pinB = defs.keyScannerPins[pinsOffset + 1];
    config->scanIndexBase = scanIndexBase;
    keyboardMain_useKeyScanner(keyScanner_encoders_update);
    keyScanner_encoders_initialize(1, encoderConfigs);
    pinsOffset += 2;
    scanIndexBase += 2;
  }
  generalKeyboard_start();
  return 0;
}
