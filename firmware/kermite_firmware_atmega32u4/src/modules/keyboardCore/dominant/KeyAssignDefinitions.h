#ifndef __KEY_ACTION_ENTRY_H__
#define __KEY_ACTION_ENTRY_H__

#include "types.h"

//trigger
enum {
  TrKeyDown = 1,
  TrKeyTap = 2,
  TrKeyHold = 3
};

//input operation type
enum {
  //OpKeyInput = 1,
  OpHoldLayer = 1,
  OpOneshotLayer = 2,
  OpSetModalLayer = 3,
  OpToggleModalLayer = 4,
  OpClearModalLayers = 5,
  //OpTapHoldTapKeyInput = 7,
  //OpTapHoldHoldLayer = 8,
  //OpKeyInputSingle = 7
};

enum {
  Layer_Global = 0, //グローバルレイヤ
  Layer_Main = 1,   //メインレイヤ
  //layer 2~14はユーザカスタムレイヤ
  Layer_NoAssign = 15, //レイヤ割り当てなし
  // LA_ANY = 0,
  // LA_MAIN = 1,
  // LA_NO_ASSIGN = 15,
};

enum {
  AssignType_KeyInput = 0,
  AssignType_LayerInvocation = 1
};

/*

assignAddress

numLayers, 2..15
numKeys, 0..128
layerIndex: 0..numLayers-1
keyIndex: 0..numKyes-1
slotIndex: 0..1

dual assign mode
addr = (layerIndex * numKeys + keyIndex) * 2 + slotIndex

single assing mode
addr = (layerIndex * numKeys + keyIndex)


KeyAssignEntry

キー入力
0b_10TT_MMMM_KKKK_KKKK
TT: trigger
MMMM: modifier
KKKK_KKKK: keycode

レイヤ
0b_11TT_0CCC_xxxx_LLLL
TT: trigger
xCCC: operation
LLLL: target layer


(
モディファイヤ
0b_11TT_1CCC_MMMM_MMMM
TT: trigger
xCCC: operation
MMMM_MMMM: modifier keycode
) reserved

*/

#endif
