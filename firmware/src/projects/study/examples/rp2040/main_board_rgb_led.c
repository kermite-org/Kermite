#include "km0/device/boardIo.h"
#include "km0/device/boardIoImpl.h"
#include "km0/device/digitalIo.h"
#include "km0/device/system.h"

int main() {
  boardIoImpl_setupLeds_proMicroRp();
  // boardIoImpl_setupLeds_qtPyRp();
  // boardIoImpl_setupLeds_tiny2040();
  // boardIoImpl_setupLeds_seeedXiaoRp2040();
  // boardIoImpl_setupLeds_kb2040();
  // boardIoImpl_setupLeds_rp2040zero();

  while (true) {
    boardIo_writeLed1(true);
    delayMs(1);
    boardIo_writeLed2(false);
    delayMs(1000);
    boardIo_writeLed1(false);
    delayMs(1);
    boardIo_writeLed2(true);
    delayMs(1000);
  }
}
