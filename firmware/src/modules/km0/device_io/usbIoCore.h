#ifndef __USBIO_CORE_H__
#define __USBIO_CORE_H__

#include "types.h"

void usbIoCore_initialize();
bool usbIoCore_hidKeyboard_writeReport(uint8_t *pReportBytes8);
bool usbIoCore_genericHid_writeData(uint8_t *pDataBytes64);
bool usbIoCore_genericHid_readDataIfExists(uint8_t *pDataBytes64);
bool usbIoCore_isConnectedToHost();
void uibioCore_internal_setSerialNumberText(uint8_t *pTextBuf, uint8_t len);
void usbIoCore_processUpdate();

#endif
