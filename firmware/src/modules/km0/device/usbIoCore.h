#ifndef __USBIO_CORE_H__
#define __USBIO_CORE_H__

#include "km0/types.h"

void usbIoCore_initialize();
bool usbIoCore_hidKeyboard_writeReport(uint8_t *pReportBytes8);
bool usbIoCore_genericHid_writeData(uint8_t *pDataBytes64);
bool usbIoCore_genericHid_readDataIfExists(uint8_t *pDataBytes64);
bool usbIoCore_isConnectedToHost();
uint8_t *usbioCore_getSerialNumberTextBufferPointer();
void usbIoCore_processUpdate();

void usbIoCore_deInit();

#endif
