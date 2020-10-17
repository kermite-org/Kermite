#include "configuratorServant.h"
#include "usbiocore.h"
#include "xf_eeprom.h"
#include <stdio.h>
#include <string.h>

//---------------------------------------------
//key assign buffer stub

#if 0
//デバッグ用, ダミーキーマッピングメモリ

#define NumKeys 12
#define NumLayers 3

static uint16_t assignBuffer[NumKeys * NumLayers] = {
  //any layer
  0b1001000000000001, //key0, any layer, keydown, keyinput, A
  0b1001000000000010, //key1, any layer, keydown, keyinput, B
  0,
  0,
  0b1001000001010111, //key4, any layer, keydown, keyinput, shift
  0b1101000100000010, //key5, any layer, keydown, holdlayer, sub layer
  0,
  0,
  0,
  0,
  0,
  0,

  //main layer
  0,
  0,
  0b1001000000000011, //key2, main layer, keydown, keyinput, C
  0b1001000000000100, //key3, main layer, keydown, keyinput, D
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,

  // //2nd layer
  0,
  0,
  0b1001000000011011, //key2, sub layer, keydown, keyinput, 0
  0b1001000000011100, //key3, sub layer, keydown, keyinput, 1
};

static uint16_t readKeyAssignMemory(uint16_t wordIndex) {
  uint16_t res = assignBuffer[wordIndex];
  printf("wordIndex: %d, res: %d\n", wordIndex, res);
  return res;
}
#endif

static uint8_t keyNum = 0;
static void (*stateNotificationCallback)(uint8_t state) = 0;

static void emitStateNotification(uint8_t state) {
  if (stateNotificationCallback) {
    stateNotificationCallback(state);
  }
}

//---------------------------------------------
//usbio

static uint8_t rawHidSendBuf[64] = { 0 };
static uint8_t rawHidRcvBuf[64] = { 0 };

static void emitGenericHidData(uint8_t *p) {
  bool done = usbioCore_genericHid_writeData(p);
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

static void emitMemoryChecksumResult(uint8_t dataKind, uint8_t checksum) {
  uint8_t *p = rawHidSendBuf;
  p[0] = 0xB0;
  p[1] = dataKind;
  p[2] = 0x22;
  p[3] = checksum;
  p[4] = 0;
  emitGenericHidData(rawHidSendBuf);
}

static void emitDeviceAttributesResponse() {
  uint8_t *p = rawHidSendBuf;
  p[0] = 0xF0;
  p[1] = 0x11;
  p[2] = keyNum;
  p[3] = 0; //todo: read side configuration from eeprom
  emitGenericHidData(rawHidSendBuf);
}

static void processReadGenericHidData() {
  bool hasData = usbioCore_genericHid_readDataIfExists(rawHidRcvBuf);
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
          uint16_t addr = p[4] << 8 | p[3];
          uint8_t len = p[5];
          uint8_t *src = p + 6;
          //uint8_t *dst = dummyStorage + addr;
          //memcpy(dst, src, len);
          for (uint8_t i = 0; i < len; i++) {
            xf_eeprom_write_byte(addr + i, src[i]);
          }
          printf("%d bytes written at %d\n", len, addr);
        }
        if (cmd == 0x21) {
          //read memory checksum for keymapping data
          uint16_t addr = p[4] << 8 | p[3];
          uint16_t len = p[6] << 8 | p[5];
          uint8_t ck = 0;
          printf("check, addr %d, len %d\n", addr, len);
          for (uint16_t i = 0; i < len; i++) {
            ck ^= xf_eeprom_read_byte(addr + i); //dummyStorage[addr + i];
          }
          printf("ck: %d\n", ck);
          emitMemoryChecksumResult(0x01, ck);
        }

        if (cmd == 0x11) {
          printf("memory write transaction done\n");
          // configurationMemoryReader_initialize();
          emitStateNotification(ConfiguratorServentState_KeyMemoryUpdationDone);
        }
      }
    }

    if (category == 0xF0) {
      uint8_t command = p[1];
      if (command == 0x10) {
        // printf("device attributes requested");
        emitDeviceAttributesResponse();
      }
    }

    if (category == 0xD0) {
      uint8_t command = p[1];
      if (command == 0x10) {
        bool enabled = p[2] == 1;
        if (enabled) {
          emitStateNotification(ConfiguratorServentState_SideBrainModeEnabled);
        } else {
          emitStateNotification(ConfiguratorServentState_SideBrainModeDisabled);
        }
      }
      if (command == 0x20) {
        usbioCore_hidKeyboard_writeReport(&p[2]);
      }
    }
  }
}

//---------------------------------------------
//exports

void configuratorServant_initialize(
    uint8_t _keyNum,
    void (*_stateNotificationCallback)(uint8_t state)) {
  keyNum = _keyNum;
  stateNotificationCallback = _stateNotificationCallback;
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