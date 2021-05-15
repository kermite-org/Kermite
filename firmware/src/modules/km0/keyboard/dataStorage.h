#ifndef __DATA_STORAGE_H__
#define __DATA_STORAGE_H__

#include "km0/types.h"

void dataStorage_initialize();

uint16_t dataStorage_getDataAddress_deviceInstanceCode();
uint16_t dataStorage_getDataAddress_parametersInitializationFlag();
uint16_t dataStorage_getDataAddress_systemParameters();
uint16_t dataStorage_getDataSize_systemParameters();

uint16_t dataStorage_getKeyMappingDataCapacity();
uint16_t dataStorage_getDataAddress_profileData();
uint16_t dataStorage_getDataAddress_profileData_profileHeader();
uint16_t dataStorage_getDataAddress_profileData_layerList();

uint16_t dataStorage_getDataAddress_profileData_keyAssigns();
uint16_t dataStorage_getDataSize_profileData_keyAssigns();

uint16_t dataStorage_getDataAddress_mappingEntreis();

#endif