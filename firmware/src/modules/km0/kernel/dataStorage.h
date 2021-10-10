#pragma once

#include "km0/types.h"

void dataStorage_initialize();

uint16_t dataStorage_getDataAddress_storageSystemParametersRevision();
uint16_t dataStorage_getDataAddress_systemParameters();
uint16_t dataStorage_getDataSize_systemParameters();

uint16_t dataStorage_getKeyMappingDataCapacity();
uint16_t dataStorage_getDataAddress_profileData();

uint16_t dataStorage_getDataAddress_profileData_profileHeader();
uint16_t dataStorage_getDataAddress_profileData_profileSettings();
uint16_t dataStorage_getDataAddress_profileData_layerList();
uint16_t dataStorage_getDataAddress_profileData_mappingEntries();

uint16_t dataStorage_getDataAddress_profileData_keyAssigns();
uint16_t dataStorage_getDataSize_profileData_keyAssigns();
