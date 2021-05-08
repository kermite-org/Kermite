import { LogicalKey } from '~/shell/services/keyboardLogic/inputLogicSimulatorD/LogicalKey';

// HIDのキーコード定義, キーボードの言語やレイアウトによらない共通部分
const enum HidKey {
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
}

const enum HidKeyUS {
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
}

// 日本語キーボード向けの定義
const enum HidKeyJA {
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
}

const Shifted = 0x100;
const NoShift = 0x200;

type LogicalKeyItem = [number, string, number, number?];
// {
//   logicalKey: number; // logical key code
//   text: string;
//   hidKeyPrimary: number; // hid keycode with shift (us mapping)
//   hidKeySecondary: number; // hid keycode with shift (jis mapping)
// };

const logicalKeyItems: LogicalKeyItem[] = [
  [LogicalKey.LK_A, 'A', HidKey.KU_A],
  [LogicalKey.LK_B, 'B', HidKey.KU_B],
  [LogicalKey.LK_C, 'C', HidKey.KU_C],
  [LogicalKey.LK_Num4, '4', HidKey.KU_Num4 | NoShift],
  [
    LogicalKey.LK_Exclamation,
    '!',
    HidKeyUS.KU_US_Num1_Exclamation | Shifted,
    HidKeyJA.KU_JA_Num1_Exclamation | Shifted,
  ],
  [
    LogicalKey.LK_Semicolon,
    ':',
    HidKeyUS.KU_US_Semicolon_Colon | NoShift,
    HidKeyJA.KU_JA_Semicolon_Plus | NoShift,
  ],
  [
    LogicalKey.LK_Plus,
    '+',
    HidKeyUS.KU_US_Equal_Plus | Shifted,
    HidKeyJA.KU_JA_Semicolon_Plus | Shifted,
  ],
  [
    LogicalKey.LK_AtMark,
    '@',
    HidKeyUS.KU_US_Num2_Atmark | NoShift,
    HidKeyJA.KU_JA_Atmark_BackQuote | Shifted,
  ],
];

function getLogicalKeysItem(logicalKey: number): LogicalKeyItem | undefined {
  return logicalKeyItems.find((item) => {
    return item[0] === logicalKey;
  });
}

export function keyCodeTableImpl_getLogicalKeyHidKeyCode(
  logicalKey: number,
  isSecondaryLayout: boolean,
) {
  const item = getLogicalKeysItem(logicalKey);
  if (item) {
    const [, , hidKeyPrimary, hidKeySecondary] = item;
    if (isSecondaryLayout && hidKeySecondary !== undefined) {
      return hidKeySecondary;
    }
    return hidKeyPrimary;
  }
}

export function keyCodeTableImpl_getLogicalKeyText(
  logicalKey: number,
): string | undefined {
  const item = getLogicalKeysItem(logicalKey);
  return item?.[1] || undefined;
}
