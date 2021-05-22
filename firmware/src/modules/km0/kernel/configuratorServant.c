#include "configuratorServant.h"
#include "commandDefinitions.h"
#include "config.h"
#include "configManager.h"
#include "dataStorage.h"
#include "km0/base/utils.h"
#include "km0/device/dataMemory.h"
#include "km0/device/usbIoCore.h"
#include "versionDefinitions.h"
#include <stdio.h>
#include <string.h>

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

static uint16_t storageAddr_DeviceInstanceCode;
static uint16_t storageAddr_profileData;
static uint16_t keyMappingDataCapacity;

static void initializeDataAddresses() {
  storageAddr_DeviceInstanceCode = dataStorage_getDataAddress_deviceInstanceCode();
  storageAddr_profileData = dataStorage_getDataAddress_profileData();
  keyMappingDataCapacity = dataStorage_getKeyMappingDataCapacity();
}

//---------------------------------------------
//rawhid interface

static uint8_t rawHidSendBuf[64] = { 0 };
static uint8_t rawHidRcvBuf[64] = { 0 };

static bool skipNotify = false;

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
  uint8_t *p = rawHidSendBuf;
  p[0] = 0xE0;
  p[1] = 0x90;
  p[2] = keyIndex;
  p[3] = isDown ? 1 : 0;
  emitGenericHidData(p);
}

static void emitRealtimeLayerStateEvent(uint16_t layerFlags) {
  uint8_t *p = rawHidSendBuf;
  p[0] = 0xE0;
  p[1] = 0x91;
  p[2] = layerFlags >> 8 & 0xFF;
  p[3] = layerFlags & 0xFF;
  emitGenericHidData(p);
}

static void emitRealtimeAssignHitEvent(uint16_t assignHitResult) {
  uint8_t *p = rawHidSendBuf;
  p[0] = 0xE0;
  p[1] = 0x92;
  p[2] = assignHitResult >> 8 & 0xFF;
  p[3] = assignHitResult & 0xFF;
  emitGenericHidData(p);
}

static void emitMemoryChecksumResult(uint8_t dataKind, uint8_t checksum) {
  uint8_t *p = rawHidSendBuf;
  p[0] = 0xB0;
  p[1] = dataKind;
  p[2] = 0x22;
  p[3] = checksum;
  p[4] = 0;
  emitGenericHidData(rawHidSendBuf);
}

static void emitSingleParameterChangedNotification(uint8_t parameterIndex, uint8_t value) {
  uint8_t *p = rawHidSendBuf;
  p[0] = 0xB0;
  p[1] = 0x02;
  p[2] = 0xE1;
  p[3] = parameterIndex;
  p[4] = value;
  emitGenericHidData(rawHidSendBuf);
}

static void copyEepromBytesToBuffer(uint8_t *dstBuffer, int dstOffset, uint16_t srcEepromAddr, uint16_t len) {
  for (uint16_t i = 0; i < len; i++) {
    dstBuffer[dstOffset + i] = dataMemory_readByte(srcEepromAddr + i);
  }
}

static void emitDeviceAttributesResponse() {
  uint8_t *p = rawHidSendBuf;
  p[0] = 0xF0;
  p[1] = 0x11;
  p[2] = Kermite_Project_ReleaseBuildRevision >> 8 & 0xFF;
  p[3] = Kermite_Project_ReleaseBuildRevision & 0xFF;
  p[4] = Kermite_ConfigStorageFormatRevision;
  p[5] = Kermite_RawHidMessageProtocolRevision;
  utils_copyBytes(p + 6, (uint8_t *)KERMITE_PROJECT_ID, 8);
  p[14] = Kermite_Project_IsResourceOriginOnline;
  p[15] = 0;
  copyEepromBytesToBuffer(p, 16, storageAddr_DeviceInstanceCode, 8);
  p[24] = keyMappingDataCapacity >> 8 & 0xFF;
  p[25] = keyMappingDataCapacity & 0xFF;
  utils_fillBytes(p + 26, 0, 16);
  size_t slen = utils_clamp(strlen(Kermite_Project_VariationName), 0, 16);
  utils_copyBytes(p + 26, (uint8_t *)Kermite_Project_VariationName, slen);
  utils_copyBytes(p + 42, (uint8_t *)Kermite_Project_McuCode, 8);
  p[50] = Kermite_ProfileBinaryFormatRevision;
  p[51] = Kermite_ConfigParametersRevision;
  emitGenericHidData(rawHidSendBuf);
}

static void emitCustomParametersReadResponse() {
  uint8_t num = NumSystemParameters;
  uint8_t *p = rawHidSendBuf;
  p[0] = 0xb0;
  p[1] = 0x02;
  p[2] = 0x81;
  p[3] = num;
  configManager_readSystemParameterValues(p + 4, num);
  configManager_readSystemParameterMaxValues(p + 4 + num, num);
  emitGenericHidData(rawHidSendBuf);
}

static void processReadGenericHidData() {
  bool hasData = usbIoCore_genericHid_readDataIfExists(rawHidRcvBuf);
  if (hasData) {
    uint8_t *p = rawHidRcvBuf;
    uint8_t category = p[0];
    if (category == 0xB0) {
      //memory operation
      uint8_t dataKind = p[1];
      uint8_t cmd = p[2];
      if (dataKind == 0x01) {
        if (cmd == 0x10) {
          printf("memory write transaction start\n");
          //configurationMemoryReader_stop();
          emitStateNotification(ConfiguratorServantState_KeyMemoryUpdationStarted);
        }

        if (cmd == 0x20) {
          //write keymapping data to ROM
          uint16_t addr = storageAddr_profileData + (p[3] << 8 | p[4]);
          uint8_t len = p[5];
          uint8_t *src = p + 6;
          dataMemory_writeBytes(addr, src, len);
          printf("%d bytes written at %d\n", len, addr);
        }
        if (cmd == 0x21) {
          //read memory checksum for keymapping data
          uint16_t addr = storageAddr_profileData + (p[3] << 8 | p[4]);
          uint16_t len = p[5] << 8 | p[6];
          uint8_t ck = 0;
          printf("check, addr %d, len %d\n", addr, len);
          for (uint16_t i = 0; i < len; i++) {
            ck ^= dataMemory_readByte(addr + i);
          }
          printf("ck: %d\n", ck);
          emitMemoryChecksumResult(0x01, ck);

          //チャンクボディデータサイズを書き込む
          dataMemory_writeWord(storageAddr_profileData - 2, len);
        }

        if (cmd == 0x11) {
          printf("memory write transaction done\n");
          // configurationMemoryReader_initialize();
          emitStateNotification(ConfiguratorServentState_KeyMemoryUpdationDone);
        }
      }

      if (dataKind == 0x02) {
        if (cmd == 0x80) {
          // printf("custom parameters read requested\n");
          emitCustomParametersReadResponse();
        }
        if (cmd == 0x90) {
          // printf("handle custom parameters bluk write\n");
          uint8_t parameterIndexBase = p[3];
          uint8_t count = p[4];
          uint8_t *ptr = p + 5;
          skipNotify = true;
          configManager_bulkWriteParameters(ptr, count, parameterIndexBase);
          skipNotify = false;
        }
        if (cmd == 0xa0) {
          // printf("handle custom parameters signle write\n");
          uint8_t parameterIndex = p[3];
          uint8_t value = p[4];
          configManager_writeParameter(parameterIndex, value);
        }

        if (cmd == 0xb0) {
          skipNotify = true;
          configManager_resetSystemParameters();
          skipNotify = false;
        }
      }

      if (dataKind == 0x03) {
        if (cmd == 0x90) {
          // printf("write device instance code\n");
          uint8_t *src = p + 3;
          dataMemory_writeBytes(storageAddr_DeviceInstanceCode, src, 8);
        }
      }
    }

    if (category == 0xF0) {
      uint8_t command = p[1];
      if (command == 0x10) {
        // printf("device attributes requested\n");
        emitDeviceAttributesResponse();
      }
    }

    if (category == 0xD0) {
      uint8_t command = p[1];
      if (command == 0x10) {
        bool enabled = p[2] == 1;
        if (enabled) {
          emitStateNotification(ConfiguratorServentState_SimulatorModeEnabled);
        } else {
          emitStateNotification(ConfiguratorServentState_SimulatorModeDisabled);
        }
      }
      if (command == 0x20) {
        usbIoCore_hidKeyboard_writeReport(&p[2]);
      }
    }
  }
}

//---------------------------------------------
//parameter changed handler

static void onParameterChanged(uint8_t parameterIndex, uint8_t value) {
  if (!skipNotify) {
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

void configuratorServant_emitRelatimeAssignHitEvent(uint16_t assignHitResult) {
  emitRealtimeAssignHitEvent(assignHitResult);
}

void configuratorServant_readDeviceInstanceCode(uint8_t *buffer) {
  copyEepromBytesToBuffer(buffer, 0, storageAddr_DeviceInstanceCode, 8);
}