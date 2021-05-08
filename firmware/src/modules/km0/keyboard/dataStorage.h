#ifndef __DATA_STORAGE_H__
#define __DATA_STORAGE_H__

#include "km0/types.h"

void dataStorage_initialize();

uint16_t dataStorage_getDataAddress_deviceInstanceCode();
uint16_t dataStorage_getDataAddress_parametersInitializationFlag();
uint16_t dataStorage_getDataAddress_systemParameters();
uint16_t dataStorage_getDataSize_systemParameters();

uint16_t dataStorage_getKeyAssignDataCapacity();
uint16_t dataStorage_getDataAddress_keyAssignsData();
uint16_t dataStorage_getDataAddress_keyAssigns_dataHeader();
uint16_t dataStorage_getDataAddress_keyAssigns_coreDataBlock();

#endif