#pragma once

#include "km0/types.h"

void usbIoCore_initialize();
bool usbIoCore_hidKeyboard_writeReport(uint8_t *pReportBytes8);
uint8_t usbIoCore_hidKeyboard_getStatusLedFlags();
bool usbIoCore_hidMouse_writeReport(uint8_t *pReportBytes3);
bool usbIoCore_genericHid_writeData(uint8_t *pDataBytes64);
bool usbIoCore_genericHid_readDataIfExists(uint8_t *pDataBytes64);
bool usbIoCore_isConnectedToHost();
uint8_t *usbioCore_getSerialNumberTextBufferPointer();
void usbIoCore_processUpdate();

void usbIoCore_deInit();
