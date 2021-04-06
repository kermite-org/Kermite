#ifndef __USBIO_CORE_H__
#define __USBIO_CORE_H__

#include "types.h"

void usbioCore_initialize();
bool usbioCore_hidKeyboard_writeReport(uint8_t *pReportBytes8);
bool usbioCore_genericHid_writeData(uint8_t *pDataBytes64);
bool usbioCore_genericHid_readDataIfExists(uint8_t *pDataBytes64);
bool usbioCore_isConnectedToHost();
void uibioCore_internal_setSerialNumberText(uint8_t *pTextBuf, uint8_t len);
void usbioCore_processUpdate();

#endif
