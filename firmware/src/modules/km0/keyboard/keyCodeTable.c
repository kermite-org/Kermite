#include "keyCodeTable.h"

enum HidKey {
  KU_RESERVED = 0,
  KU_A = 4,
  KU_B,
  KU_C,
  KU_D,
  KU_E,
  KU_F,
  KU_G,
  KU_H,
  KU_I,
  KU_J,
  KU_K,
  KU_L,
  KU_M,
  KU_N,
  KU_O,
  KU_P,
  KU_Q,
  KU_R,
  KU_S,
  KU_T,
  KU_U,
  KU_V,
  KU_W,
  KU_X,
  KU_Y,
  KU_Z,

  KU_Num1 = 30,
  KU_Num2,
  KU_Num3,
  KU_Num4,
  KU_Num5,
  KU_Num6,
  KU_Num7,
  KU_Num8,
  KU_Num9,
  KU_Num0,

  KU_Enter = 40,
  KU_Escape,
  KU_BackSpace,
  KU_Tab,
  KU_Space,

  KU_CapsLock = 57,

  KU_F1 = 58,
  KU_F2,
  KU_F3,
  KU_F4,
  KU_F5,
  KU_F6,
  KU_F7,
  KU_F8,
  KU_F9,
  KU_F10,
  KU_F11,
  KU_F12,

  KU_PrintScreen = 70,
  KU_ScrollLock = 71,
  KU_Pause = 72,
  KU_Insert = 73,
  KU_Home = 74,
  KU_PageUp = 75,
  KU_Delete = 76,
  KU_End = 77,
  KU_PageDown = 78,
  KU_RightArrow = 79,
  KU_LeftArrow,
  KU_DownArrow,
  KU_UpArrow,
  KU_NumLock = 83,

  KU_KeyPad_Slash = 84,
  KU_KeyPad_Asterisk,
  KU_KeyPad_Minus,
  KU_KeyPad_Plus,
  KU_KeyPad_Enter,
  KU_KeyPad_1,
  KU_KeyPad_2,
  KU_KeyPad_3,
  KU_KeyPad_4,
  KU_KeyPad_5,
  KU_KeyPad_6,
  KU_KeyPad_7,
  KU_KeyPad_8,
  KU_KeyPad_9,
  KU_KeyPad_0,
  KU_KeyPad_Dot,
  KU_KeyPad_Equal = 103,

  KU_F13 = 104,
  KU_F14,
  KU_F15,
  KU_F16,
  KU_F17,
  KU_F18,
  KU_F19,
  KU_F20,
  KU_F21,
  KU_F22,
  KU_F23,
  KU_F24,

  KU_Menu = 118,

  KU_KeyPad_00 = 176,
  KU_KeyPad_BackSpace = 187,

  KU_LCtrl = 224,
  KU_LShift,
  KU_LAlt,
  KU_LGui,
  KU_RCtrl,
  KU_RShift,
  KU_RAlt,
  KU_RGui,

  KU_Ctrl = 224,
  KU_Shift,
  KU_Alt,
  KU_Gui,
};

enum HidKeyUS {
  KU_US_Num1_Exclamation = 30,
  KU_US_Num2_Atmark,
  KU_US_Num3_Sharp,
  KU_US_Num4_Dollars,
  KU_US_Num5_Percent,
  KU_US_Num6_Circumflex,
  KU_US_Num7_Ampersand,
  KU_US_Num8_Asterisk,
  KU_US_Num9_LeftParenthesis,
  KU_US_Num0_RightParenthesis,

  KU_US_Minus_Undersocre = 45,
  KU_US_Equal_Plus = 46,
  KU_US_LeftSquareBracket_LeftCurlyBrace = 47,
  KU_US_RightSquareBracket_RightCurlyBrace = 48,
  KU_US_Backslash_Verticalbar = 49,
  KU_US_Sharp_Tilde = 50,
  KU_US_Semicolon_Colon = 51,
  KU_US_SingleQuote_DoubleQuote = 52,
  KU_US_BackQuote_Tilde = 53,
  KU_US_Comma_LessThan = 54,
  KU_US_Dot_GreaterThan = 55,
  KU_US_Slash_Question = 56,
};

enum HidKeyJA {
  KU_JA_Num1_Exclamation = 30,
  KU_JA_Num2_DoubleQuote,
  KU_JA_Num3_Sharp,
  KU_JA_Num4_Dollars,
  KU_JA_Num5_Percent,
  KU_JA_Num6_Ampersand,
  KU_JA_Num7_SingleQuote,
  KU_JA_Num8_LeftParenthesis,
  KU_JA_Num9_RightParenethesis,
  KU_JA_Num0,

  KU_JA_Minus_Equal = 45,
  KU_JA_Circumflex_Tilde,
  KU_JA_Atmark_BackQuote,

  KU_JA_LeftSquareBracket_LeftCurlyBrace = 48,
  KU_JA_RightSquareBracket_RightCurlyBrace = 49,
  KU_JA_Semicolon_Plus = 51,
  KU_JA_Colon_Asterisk = 52,

  KU_HankakuZenkaku = 53,

  KU_JA_Comma_LessThan = 54,
  KU_JA_Dot_GreaterThan = 55,
  KU_JA_Slash_Question = 56,

  KU_JA_BackSlash_Underscore = 135,
  KU_KatakanaHiragana = 136,
  KU_JA_Yen_VertiacalBar = 137,
  KU_Henkan = 138,
  KU_Muhenkan = 139,
};

#define Shifted 0x100
#define NoShift 0x200

enum LogicalKey {
  LK_None = 0,
  LK_A = 1,
  LK_B,
  LK_C,
  LK_Num4,
  LK_Exclamation,
  LK_Semicolon,
  LK_Plus,
  LK_AtMark,
};

typedef struct {
  uint8_t logicalKey; //logical key code
  char *text;
  uint16_t hidKeyPrimary;   //hid key code with shift (us mapping)
  uint16_t hidKeySecondary; //hid key code with shift (jis mapping)
} LogicalKeyItem;

static const LogicalKeyItem logicalKeyItems[] = {
  { LK_A, "A", KU_A },
  { LK_B, "B", KU_B },
  { LK_C, "C", KU_C },
  { LK_Num4, "4", KU_Num4 | NoShift },
  { LK_Exclamation, "!", KU_US_Num1_Exclamation | Shifted, KU_JA_Num1_Exclamation | Shifted },
  { LK_Semicolon, ";", KU_US_Semicolon_Colon | NoShift, KU_JA_Semicolon_Plus | NoShift },
  { LK_Plus, "+", KU_US_Equal_Plus | Shifted, KU_JA_Semicolon_Plus | Shifted },
  { LK_AtMark, "@", KU_US_Num2_Atmark | Shifted, KU_JA_Atmark_BackQuote | NoShift },
};

static const int NumLogicalKeyItems = sizeof(logicalKeyItems) / sizeof(logicalKeyItems[0]);

static const LogicalKeyItem *getLogicalKeyItem(uint8_t logicalKey) {
  for (int i = 0; i < NumLogicalKeyItems; i++) {
    if (logicalKeyItems[i].logicalKey == logicalKey) {
      return &logicalKeyItems[i];
    }
  }
  return 0;
}

uint16_t keyCodeTable_getLogicalKeyHidKeyCode(uint8_t logicalKey, bool isSecondaryLayout) {
  const LogicalKeyItem *item = getLogicalKeyItem(logicalKey);
  if (item) {
    if (isSecondaryLayout && item->hidKeySecondary != 0) {
      return item->hidKeySecondary;
    }
    return item->hidKeyPrimary;
  }
  return 0;
}

char *keyCodeTable_getLogicalKeyText(uint8_t logicalKey) {
  const LogicalKeyItem *item = getLogicalKeyItem(logicalKey);
  if (item) {
    return item->text;
  }
  return 0;
}