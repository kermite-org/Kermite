#include "dataStorage.h"
#include "config.h"
#include "km0/common/utils.h"
#include "km0/deviceIo/dataMemory.h"
#include "km0/deviceIo/system.h"
#include "km0/types.h"
#include "versionDefinitions.h"
#include <stdio.h>

#ifndef KERMITE_PROJECT_ID
#error KERMITE_PROJECT_ID is not defined in config.h
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
  uint8_t glowPattern;
  uint8_t glowDirection;
  uint8_t glowSpeed;
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
  .glowBrightness = 20,
  .glowPattern = 0,
  .glowDirection = 1,
  .glowSpeed = 4,
};

const uint16_t StorageHeadMagicNumber = 0xa37e;

//----------------------------------------------------------------------

enum {
  ChunkSig_UserData = 0xAA10,
  ChunkSig_SystemData = 0xAA20,
  ChunkSig_SystemParameters = 0xAA30,
  ChunkSig_CustomParameters = 0xAA40,
  ChunkSig_ProfileData = 0xAA70
};

enum {
  SubChunkSig_ProfileDataHeader = 0xBB71,
  SubChunkSig_ProfileLayerList = 0xBB74,
  SubChunkSig_ProfileShortStrings = 0xBB75,
  SubChunkSig_ProfileSlectiveAssigns = 0xBB76,
  SubChunkSig_ProfileKeyAssigns = 0xBB78,
};

//チャンク識別子を元にチャンクを探して、チャンクボディのアドレスとデータサイズを得る
static void seekChunk(uint16_t chunkSig, uint16_t posStart, uint16_t posEnd, uint16_t *out_addr, uint16_t *out_size) {
  uint16_t pos = posStart;
  // printf("--seek chunk %x\n", chunkSig);
  while (pos < posEnd) {
    uint16_t head = dataMemory_readWord(pos);
    uint16_t size = dataMemory_readWord(pos + 2);
    if (head == chunkSig) {
      pos += 4;
      *out_addr = pos;
      *out_size = size;
      // printf("chunk %x found, pos:%d size:%d\n", chunkSig, pos, size);
      return;
    } else {
      if (size == 0) {
        break;
      }
      pos += 4 + size;
    }
  }
  *out_addr = 0;
  *out_size = 0;
}

static void getChunkRegion(uint16_t chunkSig, uint16_t *out_addr, uint16_t *out_size) {
  seekChunk(chunkSig, 2, dataMemory_getCapacity(), out_addr, out_size);
}

static void getSubChunkRegion(uint16_t chunkSig, uint16_t subChunkSig, uint16_t *out_addr, uint16_t *out_size) {
  uint16_t parent_addr, parent_size;
  getChunkRegion(chunkSig, &parent_addr, &parent_size);
  if (parent_addr > 0) {
    seekChunk(subChunkSig, parent_addr, parent_addr + parent_size, out_addr, out_size);
  } else {
    *out_addr = 0;
    *out_size = 0;
  }
}

static uint16_t getChunkBodyAddress(uint16_t chunkSig) {
  uint16_t addr, size;
  getChunkRegion(chunkSig, &addr, &size);
  return addr;
}

static uint16_t getChunkBodySize(uint16_t chunkSig) {
  uint16_t addr, size;
  getChunkRegion(chunkSig, &addr, &size);
  return size;
}

static uint16_t getSubChunkBodyAddress(uint16_t chunkSig, uint16_t subChunkSig) {
  uint16_t addr, size;
  getSubChunkRegion(chunkSig, subChunkSig, &addr, &size);
  return addr;
}

static uint16_t getSubChunkBodySize(uint16_t chunkSig, uint16_t subChunkSig) {
  uint16_t addr, size;
  getSubChunkRegion(chunkSig, subChunkSig, &addr, &size);
  return size;
}

static uint16_t putBlankChunk(uint16_t addr, uint16_t chunkSig, uint16_t bodySize) {
  dataMemory_writeWord(addr, chunkSig);
  dataMemory_writeWord(addr + 2, bodySize);
  return addr + 4 + bodySize;
}

//profileDataのBodyの先頭からストレージ領域末尾までのサイズを得る
static uint16_t getKeyAssignsDataBodyLengthMax() {
  uint16_t addr = getChunkBodyAddress(ChunkSig_ProfileData);
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
  uint16_t posKeyAssignsDataBody = getChunkBodyAddress(ChunkSig_ProfileData);
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
  bool projectIdValid = utils_compareBytes(tempDataBuf, (uint8_t *)KERMITE_PROJECT_ID, 8);
  if (!projectIdValid) {
    return false;
  }
  return true;
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
  pos = putBlankChunk(pos, ChunkSig_ProfileData, 0);

  //fill initial data
  uint16_t posSystemDataBody = getChunkBodyAddress(ChunkSig_SystemData);
  if (posSystemDataBody) {
    dataMemory_writeBytes(posSystemDataBody, (uint8_t *)KERMITE_PROJECT_ID, 8);
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

uint16_t dataStorage_getDataAddress_profileData() {
  return getChunkBodyAddress(ChunkSig_ProfileData);
}

uint16_t dataStorage_getDataAddress_profileData_profileHeader() {
  return getSubChunkBodyAddress(ChunkSig_ProfileData, SubChunkSig_ProfileDataHeader);
}

uint16_t dataStorage_getDataAddress_profileData_layerList() {
  return getSubChunkBodyAddress(ChunkSig_ProfileData, SubChunkSig_ProfileLayerList);
}

uint16_t dataStorage_getDataAddress_profileData_keyAssigns() {
  return getSubChunkBodyAddress(ChunkSig_ProfileData, SubChunkSig_ProfileKeyAssigns);
}

uint16_t dataStorage_getDataSize_profileData_keyAssigns() {
  return getSubChunkBodySize(ChunkSig_ProfileData, SubChunkSig_ProfileKeyAssigns);
}