#ifndef __CONFIGURATION_MEMORY_READER_H__
#define __CONFIGURATION_MEMORY_READER_H__

#include "types.h"

#define CONFIG_STORAGE_FORMAT_REVISION 2

void configurationMemoryReader_initialize();

uint8_t configurationMemoryReader_readConfigStorageByte(uint16_t addr);

void configurationMemoryReader_stop();

#endif
