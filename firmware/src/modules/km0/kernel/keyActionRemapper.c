#include "keyActionRemapper.h"
#include "dataStorage.h"
#include "keyCodes.h"
#include "km0/device/dataMemory.h"
#include <stdio.h>

static const uint8_t RoutingChannelValueAny = 15;
static const uint8_t KeyCodeSourceValueNone = LK_NONE;
static const uint8_t KeyCodeSourceValueAny = LK_RoutingSource_Any;
static const uint8_t KeyCodeDestinationValueKeep = LK_RoutingDestination_Keep;
static const uint8_t ModifierSourceValueNone = 0;
static const uint8_t ModifierSourceValueAny = 255;
static const uint8_t ModifierDestinationValueKeep = 254;

struct {
  uint16_t addrItems;
  uint8_t numItems;
} local = {
  .addrItems = 0,
  .numItems = 0
};

void keyActionRemapper_setupDataReader() {
  uint16_t addrMappingEntriesBlock = dataStorage_getDataAddress_profileData_mappingEntries();
  if (addrMappingEntriesBlock) {
    local.numItems = dataMemory_readByte(addrMappingEntriesBlock);
    local.addrItems = addrMappingEntriesBlock + 1;
  }
}

uint16_t keyActionRemapper_translateKeyOperation(uint16_t opWord, uint8_t routingChannel) {
  uint16_t wordBase = opWord & 0xf000;
  uint8_t modifiers = (opWord >> 8) & 0x0f;
  uint8_t logicalKey = opWord & 0xff;

  for (uint8_t i = 0; i < local.numItems; i++) {
    uint16_t addrItem = local.addrItems + i * 5;
    uint8_t ch = dataMemory_readByte(addrItem + 0);
    if (ch == routingChannel || ch == RoutingChannelValueAny) {
      uint8_t srcKeyCode = dataMemory_readByte(addrItem + 1);
      uint8_t srcModifiers = dataMemory_readByte(addrItem + 2);
      if (
          (srcKeyCode == KeyCodeSourceValueNone ||
           srcKeyCode == KeyCodeSourceValueAny) &&
          (srcModifiers == ModifierSourceValueNone ||
           srcModifiers == ModifierSourceValueAny)) {
        continue;
      }
      if (
          (logicalKey == srcKeyCode || srcKeyCode == KeyCodeSourceValueAny) &&
          (modifiers == srcModifiers || srcModifiers == ModifierSourceValueAny)) {
        uint8_t dstKeyCode = dataMemory_readByte(addrItem + 3);
        uint8_t dstModifiers = dataMemory_readByte(addrItem + 4);
        if (dstKeyCode != KeyCodeDestinationValueKeep) {
          logicalKey = dstKeyCode;
        }
        if (dstModifiers != ModifierDestinationValueKeep) {
          modifiers = dstModifiers;
        }
        break;
      }
    }
  }

  return wordBase | (modifiers << 8) | logicalKey;
}
