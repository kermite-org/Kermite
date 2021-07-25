
#include "halfDuplexSerial.h"
#include "km0/base/bitOperations.h"
#include "km0/base/configImport.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/device/system.h"
#include <stdio.h>

#ifdef KM0_OPTICAL_SENSOR__SWAP_XY
static const bool outputSwapXY = true;
#else
static const bool outputSwapXY = false;
#endif

#ifdef KM0_OPTICAL_SENSOR__INVERT_X
static const int outputMultX = -1;
#else
static const int outputMultX = 1;
#endif

#ifdef KM0_OPTICAL_SENSOR__INVERT_Y
static const bool outputMultY = -1;
#else
static const bool outputMultY = 1;
#endif

enum {
  OpticalSensorRegister_ProductId1 = 0x00,
  OpticalSensorRegister_ProductId2 = 0x01,
  OpticalSensorRegister_MotionStatus = 0x02,
  OpticalSensorRegister_DeltaX = 0x03,
  OpticalSensorRegister_DeltaY = 0x04
};

void pointingDevice_initialize() {
  halfDuplexSerial_initialize();
  halfDuplexSerial_reSyncSerial();
}

void pointingDevice_update(int8_t *outDeltaX, int8_t *outDeltaY) {
  uint8_t productId = halfDuplexSerial_readData(OpticalSensorRegister_ProductId1);
  if (productId == 0x30) {
    uint8_t motionStatus = halfDuplexSerial_readData(OpticalSensorRegister_MotionStatus);
    if (bit_read(motionStatus, 7)) {
      int8_t deltaX = halfDuplexSerial_readData(OpticalSensorRegister_DeltaX);
      int8_t deltaY = halfDuplexSerial_readData(OpticalSensorRegister_DeltaY);
      if (outputSwapXY) {
        int8_t tmp = deltaY;
        deltaY = deltaX;
        deltaX = tmp;
      }
      *outDeltaX = deltaX * outputMultX;
      *outDeltaY = deltaY * outputMultY;
      //printf("mouse moved, %d %d %d %d\n", productId, motionStatus, deltaX, deltaY);
    }
  }
}
