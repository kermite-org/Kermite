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
#include "km0/visualizer/rgbLighting.h"
#include "km0/wrapper/generalKeyboard.h"
typedef struct {
  uint8_t dataHeader[4];
  char projectId[7];
  char variationId[3];
  char deviceInstanceCode[9];
  char keyboardName[33];
  bool useBoardLedsProMicroAvr;
  bool useBoardLedsProMicroRp;
  bool useBoardLedsRpiPico;
  bool useDebugUart;
  bool useMatrixKeyScanner;
  bool useDirectWiredKeyScanner;
  bool useEncoder;
  bool useRgbLighting;
  uint8_t numMatrixColumns;
  uint8_t numMatrixRows;
  uint8_t numDirectWiredKeys;
  uint8_t keyScannerPins[32];
  uint8_t rgbLightingPin;
  uint8_t rgbLightingNumLeds;
} KermiteKeyboardDefinitionData;

KermiteKeyboardDefinitionData defs = {
  .dataHeader = { 0x4B, 0x4D, 0x44, 0x46 }, //K,M,D,F
  .projectId = "000000",
  .variationId = "00",
  .deviceInstanceCode = "00000000",
  .keyboardName = "unnamed keyboard",
  .useBoardLedsProMicroAvr = false,
  .useBoardLedsProMicroRp = false,
  .useBoardLedsRpiPico = false,
  .useDebugUart = false,
  .useMatrixKeyScanner = false,
  .useDirectWiredKeyScanner = false,
  .useRgbLighting = false,
  .numMatrixColumns = 0,
  .numMatrixRows = 0,
  .numDirectWiredKeys = 0,
  .keyScannerPins = { 0 },
  .rgbLightingPin = 0,
  .rgbLightingNumLeds = 0,
};

static EncoderConfig encoderConfigs[1] = { { .pinA = 0, .pinB = 0, .scanIndexBase = 0 } };

int main() {
  utils_copyTextBytes(firmwareConfigurationData.projectId, defs.projectId, 7);
  utils_copyTextBytes(firmwareConfigurationData.variationId, defs.variationId, 3);
  utils_copyTextBytes(firmwareConfigurationData.deviceInstanceCode, defs.deviceInstanceCode, 9);
  utils_copyTextBytes(firmwareConfigurationData.keyboardName, defs.keyboardName, 33);

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
    rgbLighting_initialize(defs.rgbLightingPin, defs.rgbLightingNumLeds, defs.rgbLightingNumLeds);
  }
  uint pinsOffset = 0;
  uint8_t scanIndexBase = 0;
  if (defs.useMatrixKeyScanner) {
    uint8_t numColumns = defs.numMatrixColumns;
    uint8_t numRows = defs.numMatrixRows;
    uint8_t *columnPins = defs.keyScannerPins;
    uint8_t *rowPins = defs.keyScannerPins + defs.numMatrixColumns;
    keyScanner_basicMatrix_initialize(numRows, numColumns, rowPins, columnPins, scanIndexBase);
    keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
    pinsOffset += numColumns + numRows;
    scanIndexBase += numColumns * numRows;
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
