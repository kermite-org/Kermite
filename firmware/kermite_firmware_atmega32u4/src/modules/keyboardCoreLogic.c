#include "keyboardCoreLogic.h"
#include "xf_eeprom.h"
#include <stdio.h>

static uint8_t currentLayerIndex = 0;
static uint8_t hidReportBuf[8] = { 0 };
static uint16_t keyAttachedOperationWords[128] = { 0 };

uint8_t keyboardCoreLogic_getCurrentLayerIndex() {
  return currentLayerIndex;
}

uint8_t *keyboardCoreLogic_getOutputHidReportBytes() {
  return hidReportBuf;
}

static uint8_t readEepRomByte(uint16_t addr) {
  return xf_eeprom_read_byte(addr);
}

static uint16_t readEepRomWordBigEndian(uint16_t addr) {
  uint8_t a = xf_eeprom_read_byte(addr);
  uint8_t b = xf_eeprom_read_byte(addr + 1);
  return a << 8 | b;
}

static uint16_t getAssignsBlockAddressForKey(uint8_t targetKeyIndex) {
  uint16_t addr = 24;
  while (addr < 1024) {
    uint8_t data = readEepRomByte(addr);
    if (data == 0) {
      break;
    }
    if ((data & 0x80) > 0) {
      uint8_t keyIndex = data & 0x7f;
      if (keyIndex == targetKeyIndex) {
        return addr;
      }
    }
    addr++;
    uint8_t bodyLength = readEepRomByte(addr++);
    addr += bodyLength;
  }
  return 0;
}

static uint16_t getAssignBlockAddressForLayer(uint16_t baseAddr, uint8_t targetLayerIndex) {
  uint8_t len = readEepRomByte(baseAddr + 1);
  uint16_t addr = baseAddr + 2;
  uint16_t endAddr = baseAddr + len;
  while (addr < endAddr) {
    uint8_t data = readEepRomByte(addr);
    uint8_t layerIndex = data & 0b1111;
    if (layerIndex == targetLayerIndex) {
      return addr;
    }
    addr++;
    uint8_t tt = data >> 4 & 0b11;
    uint8_t isDual = tt == 0b10;
    uint8_t numBlockBytes = isDual ? 4 : 2;
    addr += numBlockBytes;
  }
  return 0;
}

static uint16_t getAssignOperationWordCore(uint16_t base, bool isSecondary) {
  uint8_t entryHeaderByte = readEepRomByte(base);
  uint8_t tt = entryHeaderByte >> 4 & 0b11;
  uint8_t isDual = tt == 0b10;
  uint8_t offset = (isDual && isSecondary) ? 3 : 1;
  return readEepRomWordBigEndian(base + offset);
}

static uint16_t getAssignOperationWord(uint8_t keyIndex, uint8_t layerIndex, bool isSecondary) {
  uint16_t addr0 = getAssignsBlockAddressForKey(keyIndex);
  if (addr0 > 0) {
    uint16_t addr1 = getAssignBlockAddressForLayer(addr0, layerIndex);
    if (addr1 > 0) {
      uint16_t opWord = getAssignOperationWordCore(addr1, isSecondary);
      printf("ki:%d, li:%d, opword:%x\n", keyIndex, layerIndex, opWord);
      return opWord;
    }
  }
  return 0;
}

static const uint8_t OpType_keyInput = 0b01;
static const uint8_t OpType_layerCall = 0b10;

static void handleKeyInputDown(uint8_t keyIndex) {
  uint16_t opWord = getAssignOperationWord(keyIndex, currentLayerIndex, false);
  if (!opWord) {
    opWord = getAssignOperationWord(keyIndex, 0, false);
  }
  if (opWord) {
    uint8_t opType = (opWord >> 14) & 0b11;
    if (opType == OpType_keyInput) {
      uint16_t hidKey = opWord & 0x3ff;
      uint8_t modFlag = (opWord >> 10) & 0b1111;
      if (modFlag) {
        hidReportBuf[0] |= modFlag;
      }
      if (hidKey) {
        uint8_t keyCode = hidKey & 0xff;
        bool shiftOn = hidKey & 0x100;
        bool shiftOff = hidKey & 0x200;
        bool isOtherModifiersClean = (hidReportBuf[0] & 0b1101) == 0;
        if (shiftOn) {
          hidReportBuf[0] = 2;
        }
        if (shiftOff && isOtherModifiersClean) {
          hidReportBuf[0] = 0;
        }
        if (keyCode) {
          hidReportBuf[2] = keyCode;
        }
      }
    }
    if (opType == OpType_layerCall) {
      uint8_t layerIndex = (opWord >> 8) & 0b1111;
      bool withShift = (opWord >> 13) & 0b1;
      currentLayerIndex = layerIndex;
      if (withShift) {
        hidReportBuf[0] = 2;
      }
    }
    keyAttachedOperationWords[keyIndex] = opWord;
  }
}

static void handleKeyInputUp(uint8_t keyIndex) {
  uint16_t opWord = keyAttachedOperationWords[keyIndex];
  if (opWord) {
    uint8_t opType = (opWord >> 14) & 0b11;
    if (opType == OpType_keyInput) {
      uint16_t hidKey = opWord & 0x3ff;
      uint8_t modFlag = (opWord >> 10) & 0b1111;
      if (modFlag) {
        hidReportBuf[0] &= ~modFlag;
      }
      if (hidKey) {
        uint8_t keyCode = hidKey & 0xff;
        bool shiftOn = hidKey & 0x100;
        bool shiftOff = hidKey & 0x200;
        if (shiftOn) {
          hidReportBuf[0] = 0;
        }
        if (shiftOff) {
        }
        if (keyCode) {
          hidReportBuf[2] = 0;
        }
      }
    }
    if (opType == OpType_layerCall) {
      currentLayerIndex = 0;
      uint8_t withShift = (opWord >> 13) & 0b1;
      if (withShift) {
        hidReportBuf[0] = 0;
      }
    }
    keyAttachedOperationWords[keyIndex] = 0;
  }
}

void keyboardCoreLogic_initialize() {}

void keyboardCoreLogic_issuePhysicalKeyStateChanged(uint8_t keyIndex, bool isDown) {
  if (isDown) {
    handleKeyInputDown(keyIndex);
  } else {
    handleKeyInputUp(keyIndex);
  }
}

void keyboardCoreLogic_processTicker(uint8_t ms) {
}