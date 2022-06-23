#include "configuratorServant.h"
#include "commandDefinitions.h"
#include "configManager.h"
#include "dataStorage.h"
#include "firmwareMetadata.h"
#include "km0/base/configImport.h"
#include "km0/base/utils.h"
#include "km0/device/dataMemory.h"
#include "km0/device/usbIoCore.h"
#include "versionDefinitions.h"
#include <stdio.h>
#include <string.h>

//---------------------------------------------
enum {
  RawHidOpcode_ConnectionOpened = 0xf0,
  RawHidOpcode_ConnectionClosing = 0xf1,
  RawHidOpcode_DeviceAttributesRequest = 0xf2,
  RawHidOpcode_DeviceAttributesResponse = 0xf3,

  RawHidOpcode_RealtimeKeyStateEvent = 0xa0,
  RawHidOpcode_RealtimeLayerStateEvent = 0xa1,

  RawHidOpcode_MemoryWriteTransactionStart = 0xb0,
  RawHidOpcode_MemoryWriteTransactionDone = 0xb1,
  RawHidOpcode_MemoryWriteOperation = 0xb2,
  RawHidOpcode_MemoryChecksumRequest = 0xb3,
  RawHidOpcode_MemoryChecksumResponse = 0xb4,

  RawHidOpcode_ParametersReadAllRequest = 0xc0,
  RawHidOpcode_ParametersReadAllResponse = 0xc1,
  RawHidOpcode_ParametersWriteAllOperation = 0xc2,
  RawHidOpcode_ParameterSingleWriteOperation = 0xc3,
  RawHidOpcode_ParametersResetOperation = 0xc4,
  RawHidOpcode_ParameterChangedNotification = 0xc5,

  RawHidOpcode_MuteModeSpec = 0xd0,
  RawHidOpcode_SimulationModeSpec = 0xd1,
  RawHidOpcode_SimulationModeOutputHidReportWrite = 0xd2,
};

//---------------------------------------------
//callbacks

static void (*stateNotificationCallback)(uint8_t state) = 0;

static void emitStateNotification(uint8_t state) {
  if (stateNotificationCallback) {
    stateNotificationCallback(state);
  }
}

//---------------------------------------------
//storage data addresses

static uint16_t storageAddr_profileData;
static uint16_t keyMappingDataCapacity;

static void initializeDataAddresses() {
  storageAddr_profileData = dataStorage_getDataAddress_profileData();
  keyMappingDataCapacity = dataStorage_getKeyMappingDataCapacity();
}

//---------------------------------------------
//rawhid interface

static uint8_t rawHidTempBuf[64] = { 0 };

static bool rawHidFirstConnectDone = false;

static void emitGenericHidData(uint8_t *p) {
  if (!usbIoCore_isConnectedToHost()) {
    return;
  }
  bool done = usbIoCore_genericHid_writeData(p);
  if (!done) {
    printf("[warn] failed to write rawhid data\n");
  }
}

static void emitRealtimePhysicalKeyStateEvent(uint8_t keyIndex, bool isDown) {
  uint8_t *p = rawHidTempBuf;
  p[0] = RawHidOpcode_RealtimeKeyStateEvent;
  p[1] = keyIndex;
  p[2] = isDown ? 1 : 0;
  emitGenericHidData(p);
}

static void emitRealtimeLayerStateEvent(uint16_t layerFlags) {
  uint8_t *p = rawHidTempBuf;
  p[0] = RawHidOpcode_RealtimeLayerStateEvent;
  p[1] = layerFlags >> 8 & 0xFF;
  p[2] = layerFlags & 0xFF;
  emitGenericHidData(p);
}

static void emitMemoryChecksumResult(uint8_t checksum) {
  uint8_t *p = rawHidTempBuf;
  p[0] = RawHidOpcode_MemoryChecksumResponse;
  p[1] = checksum;
  emitGenericHidData(rawHidTempBuf);
}

static void emitSingleParameterChangedNotification(uint8_t parameterIndex, uint8_t value) {
  uint8_t *p = rawHidTempBuf;
  p[0] = RawHidOpcode_ParameterChangedNotification;
  p[1] = parameterIndex;
  p[2] = value;
  emitGenericHidData(rawHidTempBuf);
}

static void emitDeviceAttributesResponse() {
  uint8_t *p = rawHidTempBuf;
  p[0] = RawHidOpcode_DeviceAttributesResponse;
  p[1] = Kermite_RawHidMessageProtocolRevision;
  p[2] = Kermite_ConfigStorageFormatRevision;
  p[3] = Kermite_ProfileBinaryFormatRevision;
  p[4] = Kermite_ConfigParametersRevision;
  utils_copyBytes(p + 5, (uint8_t *)Kermite_Project_McuCode, 3);
  utils_copyBytes(p + 8, (uint8_t *)commonFirmwareMetadata.projectId, 6);
  utils_copyBytes(p + 15, (uint8_t *)KERMITE_FIRMWARE_ID, 6);
  p[21] = Kermite_Project_IsResourceOriginOnline;
  p[22] = Kermite_Project_ReleaseBuildRevision >> 8 & 0xFF;
  p[23] = Kermite_Project_ReleaseBuildRevision & 0xFF;
  utils_fillBytes(p + 24, 0, 16);
  size_t slen = utils_clamp(strlen(Kermite_Project_VariationName), 0, 16);
  utils_copyBytes(p + 24, (uint8_t *)Kermite_Project_VariationName, slen);
  utils_copyBytes(p + 40, (uint8_t *)commonFirmwareMetadata.deviceInstanceCode, 4);
  utils_copyBytes(p + 44, (uint8_t *)commonFirmwareMetadata.variationId, 2);
  p[48] = keyMappingDataCapacity >> 8 & 0xFF;
  p[49] = keyMappingDataCapacity & 0xFF;
  emitGenericHidData(rawHidTempBuf);
}

static void emitCustomParametersReadResponse() {
  uint8_t num = NumSystemParameters;
  uint8_t *p = rawHidTempBuf;
  p[0] = RawHidOpcode_ParametersReadAllResponse;
  p[1] = num;
  uint16_t parameterExposeFlags = configManager_getParameterExposeFlags();
  p[2] = parameterExposeFlags >> 8 & 0xFF;
  p[3] = parameterExposeFlags & 0xFF;
  configManager_readSystemParameterValues(p + 4, num);
  configManager_readSystemParameterMaxValues(p + 4 + num, num);
  emitGenericHidData(rawHidTempBuf);
}

static void processReadGenericHidData() {
  bool hasData = usbIoCore_genericHid_readDataIfExists(rawHidTempBuf);
  if (!hasData) {
    return;
  }

  uint8_t *p = rawHidTempBuf;
  uint8_t cmd = p[0];

  if (cmd == RawHidOpcode_ConnectionOpened) {
    emitStateNotification(ConfiguratorServantEvent_ConnectedByHost);
  }

  if (cmd == RawHidOpcode_ConnectionClosing) {
    emitStateNotification(ConfiguratorServantEvent_ConnectionClosingByHost);
  }

  if (cmd == RawHidOpcode_DeviceAttributesRequest) {
    // printf("device attributes requested\n");
    emitDeviceAttributesResponse();
    rawHidFirstConnectDone = true;
  }

  if (cmd == RawHidOpcode_MemoryWriteTransactionStart) {
    printf("memory write transaction start\n");
    //configurationMemoryReader_stop();
    emitStateNotification(ConfiguratorServantEvent_KeyMemoryUpdationStarted);
  }

  if (cmd == RawHidOpcode_MemoryWriteOperation) {
    //write keymapping data to ROM
    uint16_t addr = storageAddr_profileData + (p[1] << 8 | p[2]);
    uint8_t len = p[3];
    uint8_t *src = p + 4;
    dataMemory_writeBytes(addr, src, len);
    printf("%d bytes written at %d\n", len, addr);
  }

  if (cmd == RawHidOpcode_MemoryChecksumRequest) {
    //read memory checksum for keymapping data
    uint16_t addr = storageAddr_profileData + (p[1] << 8 | p[2]);
    uint16_t len = p[3] << 8 | p[4];
    uint8_t ck = 0;
    printf("check, addr %d, len %d\n", addr, len);
    for (uint16_t i = 0; i < len; i++) {
      ck ^= dataMemory_readByte(addr + i);
    }
    printf("ck: %d\n", ck);
    emitMemoryChecksumResult(ck);

    //チャンクボディデータサイズを書き込む
    dataMemory_writeWord(storageAddr_profileData - 2, len);
  }

  if (cmd == RawHidOpcode_MemoryWriteTransactionDone) {
    printf("memory write transaction done\n");
    // configurationMemoryReader_initialize();
    emitStateNotification(ConfiguratorServantEvent_KeyMemoryUpdationDone);
  }

  if (cmd == RawHidOpcode_ParametersReadAllRequest) {
    // printf("custom parameters read requested\n");
    emitCustomParametersReadResponse();
  }

  if (cmd == RawHidOpcode_ParametersWriteAllOperation) {
    // printf("handle custom parameters bluk write\n");
    uint8_t parameterIndexBase = p[1];
    uint8_t count = p[2];
    uint8_t *ptr = p + 3;
    configManager_bulkWriteParameters(ptr, count, parameterIndexBase);
  }

  if (cmd == RawHidOpcode_ParameterSingleWriteOperation) {
    // printf("handle custom parameters signle write\n");
    uint8_t parameterIndex = p[1];
    uint8_t value = p[2];
    // skipNotify = true;
    configManager_writeParameter(parameterIndex, value);
    // skipNotify = false;
  }

  if (cmd == RawHidOpcode_ParametersResetOperation) {
    configManager_resetSystemParameters();
  }

  if (cmd == RawHidOpcode_SimulationModeSpec) {
    bool enabled = p[1] == 1;
    uint8_t event = enabled ? ConfiguratorServantEvent_SimulatorModeEnabled : ConfiguratorServantEvent_SimulatorModeDisabled;
    emitStateNotification(event);
  }

  if (cmd == RawHidOpcode_SimulationModeOutputHidReportWrite) {
    usbIoCore_hidKeyboard_writeReport(&p[1]);
  }

  if (cmd == RawHidOpcode_MuteModeSpec) {
    bool enabled = p[1] == 1;
    uint8_t event = enabled ? ConfiguratorServantEvent_MuteModeEnabled : ConfiguratorServantEvent_MuteModeDisabled;
    emitStateNotification(event);
  }
}

//---------------------------------------------
//parameter changed handler

static void onParameterChanged(uint8_t eventType, uint8_t parameterIndex, uint8_t value) {
  if (rawHidFirstConnectDone && eventType == ParameterChangeEventType_ChangedSinle) {
    emitSingleParameterChangedNotification(parameterIndex, value);
  }
}

//---------------------------------------------
//exports

void configuratorServant_initialize(void (*_stateNotificationCallback)(uint8_t state)) {
  stateNotificationCallback = _stateNotificationCallback;
  configManager_addParameterChangeListener(onParameterChanged);
  initializeDataAddresses();
}

void configuratorServant_processUpdate() {
  processReadGenericHidData();
}

void configuratorServant_emitRealtimeKeyEvent(uint8_t keyIndex, bool isDown) {
  emitRealtimePhysicalKeyStateEvent(keyIndex, isDown);
}

void configuratorServant_emitRelatimeLayerEvent(uint16_t layerFlags) {
  emitRealtimeLayerStateEvent(layerFlags);
}
