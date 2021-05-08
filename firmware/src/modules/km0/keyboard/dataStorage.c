#include "dataStorage.h"
#include "config.h"
#include "km0/common/utils.h"
#include "km0/deviceIo/dataMemory.h"
#include "km0/deviceIo/system.h"
#include "km0/types.h"
#include "versions.h"
#include <stdio.h>

#ifndef PROJECT_ID
#error PROJECT_ID is not defined in config.h
#endif

#ifndef KM0_STORAGE__USER_STORAGE_SIZE
#define KM0_STORAGE__USER_STORAGE_SIZE 0
#endif
const uint16_t UserStorageDataSize = KM0_STORAGE__USER_STORAGE_SIZE;

#ifndef KM0_KEYBOARD__NUM_CUSTOM_PARAMETERS
#define KM0_KEYBOARD__NUM_CUSTOM_PARAMETERS 0
#endif
const uint16_t CustomParametersDataSize = KM0_KEYBOARD__NUM_CUSTOM_PARAMETERS;

typedef struct {
  uint8_t projectId[8];
  uint8_t deviceInstanceCode[8];
  uint8_t parametersDataInitializationFlag;
  uint8_t softwareStorageFomartRevision;
} T_SystemData;

typedef struct {
  uint8_t emitKeyStroke;
  uint8_t emitRealtimeEvents;
  uint8_t keyHoldLedOutput;
  uint8_t heartbeatLedOutput;
  uint8_t masterSide;
  uint8_t secondSystemLayoutActive;
  uint8_t simulatorModeActive;
  uint8_t alterAssignsActive;
  uint8_t glowActive;
  uint8_t glowColor;
  uint8_t glowBrightness;
} T_SystemParametersSet;

const uint16_t SystemDataSize = sizeof(T_SystemData);
const uint16_t SystemParametersDataSize = sizeof(T_SystemParametersSet);

static const T_SystemParametersSet systemParametersDefault = {
  .emitKeyStroke = true,
  .emitRealtimeEvents = true,
  .keyHoldLedOutput = true,
  .heartbeatLedOutput = true,
  .masterSide = 0,
  .secondSystemLayoutActive = false,
  .simulatorModeActive = false,
  .alterAssignsActive = false,
  .glowActive = false,
  .glowColor = 0,
  .glowBrightness = 20
};

const uint16_t StorageHeadMagicNumber = 0xa37e;

//----------------------------------------------------------------------

enum {
  ChunkSig_UserData = 0xAA10,
  ChunkSig_SystemData = 0xAA20,
  ChunkSig_SystemParameters = 0xAA30,
  ChunkSig_CustomParameters = 0xAA40,
  ChunkSig_KeyAssignsData = 0xAA70
};

enum {
  SubChunkSig_KeyAssignsDataHeader = 0xBB71,
  SubChunkSig_LayerListBlock = 0xBB74,
  SubChunkSig_ShortStringsBlock = 0xBB75,
  SubChunkSig_SlectiveAssignsBlock = 0xBB76,
  SubChunkSig_KeyAssignsDataBlock = 0xBB78,
};

typedef struct {
  uint16_t address;
  uint16_t size;
} ChunkSpan;

//チャンク識別子を元にチャンクを探して、チャンクボディのアドレスとデータサイズを得る
static ChunkSpan getChunkSpan(uint16_t chunkSig) {
  uint16_t totalSize = dataMemory_getCapacity();
  uint16_t pos = 2;
  ChunkSpan result;
  while (pos < totalSize) {
    uint16_t head = dataMemory_readWord(pos);
    uint16_t size = dataMemory_readWord(pos + 2);
    if (head == chunkSig) {
      pos += 4;
      result.address = pos;
      result.size = size;
      return result;
    } else {
      if (size == 0) {
        break;
      }
      pos += 4 + size;
    }
  }
  result.address = 0;
  result.size = 0;
  return result;
}

static uint16_t getChunkBodyAddress(uint16_t chunkSig) {
  ChunkSpan span = getChunkSpan(chunkSig);
  return span.address;
}

static uint16_t getChunkBodySize(uint16_t chunkSig) {
  ChunkSpan span = getChunkSpan(chunkSig);
  return span.size;
}

static uint16_t getSubChunkBodyAddress(uint16_t chunkSig, uint16_t subChunkSig) {
  ChunkSpan span = getChunkSpan(chunkSig);
  if (span.address > 0) {
    uint16_t pos = span.address + 4;
    uint16_t bodySize = span.size;
    while (pos < bodySize) {
      uint16_t head = dataMemory_readWord(pos);
      uint16_t size = dataMemory_readWord(pos + 2);
      if (head == subChunkSig) {
        pos += 4;
        return pos;
      } else {
        pos += 4 + size;
      }
    }
  }
  return 0;
}

static uint16_t putBlankChunk(uint16_t addr, uint16_t chunkSig, uint16_t bodySize) {
  dataMemory_writeWord(addr, chunkSig);
  dataMemory_writeWord(addr + 2, bodySize);
  return addr + 4 + bodySize;
}

// uint16_t putPresetChunk(uint16_t addr, uint16_t chunkSig, uint8_t *body, uint16_t bodySize) {
//   dataMemory_writeWord(addr, chunkSig);
//   dataMemory_writeWord(addr + 2, bodySize);
//   dataMemory_writeBytes(addr + 4, body, bodySize);
//   return addr + 4 + bodySize;
// }

// void *readChunkBodyAsStruct(uint16_t chunkSig, uint8_t *buffer, uint16_t size) {
//   ChunkSpan span = getChunkSpan(chunkSig);
//   if (span.size == size) {
//     dataMemory_readBytes(span.addr, buffer, size);
//     return buffer;
//   }
//   return NULL;
// }

//keyAssignsDataBodyの先頭からストレージ領域末尾までのサイズを得る
static uint16_t getKeyAssignsDataBodyLengthMax() {
  uint16_t addr = getChunkBodyAddress(ChunkSig_KeyAssignsData);
  if (addr) {
    return dataMemory_getCapacity() - addr;
  }
  return 0;
}

static bool validateStorageDataFormat() {
  uint16_t first = dataMemory_readWord(0);
  if (first != StorageHeadMagicNumber) {
    return false;
  }
  uint16_t szUserData = getChunkBodySize(ChunkSig_UserData);
  uint16_t szSystemData = getChunkBodySize(ChunkSig_SystemData);
  uint16_t szSystemParameters = getChunkBodySize(ChunkSig_SystemParameters);
  uint16_t szCustomParameters = getChunkBodySize(ChunkSig_CustomParameters);
  uint16_t posKeyAssignsDataBody = getChunkBodyAddress(ChunkSig_KeyAssignsData);
  bool dataLayoutValid = (szUserData == UserStorageDataSize) &&
                         (szSystemData == SystemDataSize) &&
                         (szSystemParameters == SystemParametersDataSize) &&
                         (szCustomParameters == CustomParametersDataSize) &&
                         (posKeyAssignsDataBody > 0);
  if (!dataLayoutValid) {
    return false;
  }
  //check project id stored in system data body
  static uint8_t tempDataBuf[10];
  uint16_t posSystemDataBody = getChunkBodyAddress(ChunkSig_SystemData);
  dataMemory_readBytes(posSystemDataBody, tempDataBuf, 8);
  bool projectIdValid = utils_compareBytes(tempDataBuf, (uint8_t *)PROJECT_ID, 8);
  if (!projectIdValid) {
    return false;
  }
}

static void resetDataStorage() {
  printf("reset data storage for new project\n");
  dataMemory_clearAllZero();
  dataMemory_writeWord(0, StorageHeadMagicNumber);
  uint16_t pos = 2;
  //make regions
  if (UserStorageDataSize > 0) {
    pos = putBlankChunk(pos, ChunkSig_UserData, UserStorageDataSize);
  }
  pos = putBlankChunk(pos, ChunkSig_SystemData, SystemDataSize);
  pos = putBlankChunk(pos, ChunkSig_SystemParameters, SystemParametersDataSize);
  if (CustomParametersDataSize > 0) {
    pos = putBlankChunk(pos, ChunkSig_CustomParameters, CustomParametersDataSize);
  }
  pos = putBlankChunk(pos, ChunkSig_KeyAssignsData, 0);

  //fill initial data
  uint16_t posSystemDataBody = getChunkBodyAddress(ChunkSig_SystemData);
  if (posSystemDataBody) {
    dataMemory_writeBytes(posSystemDataBody, (uint8_t *)PROJECT_ID, 8);
  }
  uint16_t posSystemParameters = getChunkBodyAddress(ChunkSig_SystemParameters);
  if (posSystemParameters) {
    dataMemory_writeBytes(posSystemParameters, (uint8_t *)&systemParametersDefault, SystemParametersDataSize);
  }
}

//----------------------------------------------------------------------
//exports

void dataStorage_initialize() {
  printf("datastorage initialize\n");
  bool storageValid = validateStorageDataFormat();
  if (!storageValid) {
    resetDataStorage();
  } else {
    printf("storage data valid\n");
  }
}

uint16_t dataStorage_getKeyAssignDataCapacity() {
  return getKeyAssignsDataBodyLengthMax();
}

uint16_t dataStorage_getDataAddress_deviceInstanceCode() {
  uint16_t base = getChunkBodyAddress(ChunkSig_SystemData);
  return base + 8;
}

uint16_t dataStorage_getDataAddress_parametersInitializationFlag() {
  uint16_t base = getChunkBodyAddress(ChunkSig_SystemData);
  return base + 9;
}

uint16_t dataStorage_getDataAddress_systemParameters() {
  return getChunkBodyAddress(ChunkSig_SystemParameters);
}

uint16_t dataStorage_getDataSize_systemParameters() {
  return SystemParametersDataSize;
}

uint16_t dataStorage_getDataAddress_keyAssignsData() {
  return getChunkBodyAddress(ChunkSig_KeyAssignsData);
}

uint16_t dataStorage_getDataAddress_keyAssigns_dataHeader() {
  return getSubChunkBodyAddress(ChunkSig_KeyAssignsData, SubChunkSig_KeyAssignsDataHeader);
}

uint16_t dataStorage_getDataAddress_keyAssigns_coreDataBlock() {
}