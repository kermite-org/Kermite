#include "debug_uart.h"
#include "digitalIo.h"
#include "km0/base/bitOperations.h"
#include <avr/io.h>
#include <avr/pgmspace.h>
#include <stdio.h>
#include <util/delay.h>

#include "keyMatrixScanner8x8.h"
#include "usbIoCore.h"

#include "./keyboardCore/dominant/LocalizationKeyMapper/localizationKeyMapper.h"
#include "./keyboardCore/dominant/LogicalKeycodes.h"
#include "./keyboardCore/dominant/keyInputLogicModel.h"
#include "./keyboardCore/hidKeyCombinationManager.h"

#include "ConfigurationMemoryReader.h"
#include "configuratorServant.h"

//---------------------------------------------
//board io

#define pin_LED0 P_F4
#define pin_LED1 P_F5

static void initBoardIo() {
  digitalIo_setOutput(pin_LED0);
  digitalIo_setOutput(pin_LED1);
}

static void toggleLED0() {
  digitalIo_toggle(pin_LED0);
}

static void outputLED1(bool val) {
  digitalIo_write(pin_LED1, val);
}

//---------------------------------------------
//definitions

#define NumRows 3
#define NumColumns 4
#define NumKeys (NumRows * NumColumns)

static const uint8_t rowPins[NumRows] = { P_C6, P_D7, P_E6 };
static const uint8_t columnPins[NumColumns] = { P_F6, P_F7, P_B1, P_B3 };

//---------------------------------------------
//local state

static uint8_t pressedKeyCount = 0;

//---------------------------------------------

static void emitHidKeyStateReport(uint8_t *pReportBytes8) {
  bool done = usbIoCore_hidKeyboard_writeReport(pReportBytes8);
  if (!done) {
    //todo: 送信できない場合のために、usioCore内でホストから次のデータ要求があった場合に再送信する実装を行う
    printf("[warn] failed to write keyboard report\n");
  }
}

//---------------------------------------------
//callbacks for logic model

//ロジックモデルのキー配列メモリ読み出し要求に応答するハンドラ
static uint16_t keyAssignMemoryReadHandler(uint16_t wordIndex) {
  // return configuratorServant_readKeyAssignMemory_word(wordIndex);
  // return readKeyAssignMemory(wordIndex);
  return configurationMemoryReader_readKeyAssignMemoryWord(wordIndex);
}

#if 0
static void onLayerChanged(uint8_t layerIndex) {
  configuratorServant_emitRelatimeLayerEvent(layerIndex);
}
#endif

//ロジックモデルから送られる論理キー発行要求を受け取るハンドラ
static void onLogicalKeyIssued(uint16_t logicalKey, bool isDown) {
  printf("onLogicalKeyIssued %d %d\n", logicalKey, isDown);
  if (K_Special_0 <= logicalKey && logicalKey < K_Special_15) {
    //キーボード固有の動作モード変更/LED点灯パターンの変更などはここで処理する
    return;
  }
  //キーボードレイアウトに従って論理キーからモディファイヤを含むHIDキーコードを得る
  uint16_t hidKey = localizationKeyMapper_logicalKeyToHidKey(logicalKey);
  printf("hidKey: %d\n", hidKey);
  if (hidKey) {
    //同時押し管理モジュールでHIDレポートを更新
    uint8_t *report = hidKeyCombinationManager_updateReport(hidKey, isDown);
    //HIDレポートを送信
    emitHidKeyStateReport(report);
  }
}

//---------------------------------------------
//callbacks for keymatrix scanner

//キーマトリクススキャナでキー状態が変化したときに呼ばれるハンドラ
static void onPhysicalKeyStateChanged(uint8_t keySlotIndex, bool isDown) {
  uint8_t keyIndex = keySlotIndex;
  if (isDown) {
    printf("keydown %d\n", keyIndex);
    pressedKeyCount++;
  } else {
    printf("keyup %d\n", keyIndex);
    pressedKeyCount--;
  }

  //ロジックモデルに物理キーの状態変化を入力
  keyInputLogicModel_issuePhysicalKeyStateChanged(keyIndex, isDown);

  //ユーティリティソフトウェアのためにGenericHID経由で物理キー状態変化イベントを送信
  configuratorServant_emitRealtimeKeyEvent(keyIndex, isDown);
}

//---------------------------------------------

void devEntry() {
  initDebugUART(38400);
  printf("start dev1\n");

  initBoardIo();

  usbIoCore_initialize();

  keyInputLogicModel_initialize(
      false, NumKeys, /*NumLayers,*/ onLogicalKeyIssued, keyAssignMemoryReadHandler);

  localizationKeyMapper_configureKeyboardLanguage(LocalizationKeyboardLanguage_JP);

  //initKeyAssignsReader();
  configurationMemoryReader_initialize(NumKeys);

  keyMatrixScanner_initialize(
      NumRows, NumColumns, rowPins, columnPins, onPhysicalKeyStateChanged);

  uint16_t cnt = 0;
  while (1) {
    cnt++;
    if (cnt % 10 == 0) {
      keyMatrixScanner_update();
      outputLED1(pressedKeyCount > 0);
    }
    if (cnt % 100 == 0) {
      toggleLED0();
    }
    _delay_ms(1);
    configuratorServant_processUpdate();
  }
}

int main() {
  USBCON = 0;
  devEntry();
  return 0;
}