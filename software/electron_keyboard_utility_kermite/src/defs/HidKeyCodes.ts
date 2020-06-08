import { VirtualKey } from './VirtualKeys';
import { IKeyboardLayoutStandard } from './ConfigTypes';

//HIDのキーコード定義, キーボードの言語やレイアウトによらない共通部分
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
  KU_Gui
}

const enum HidKeyUS {
  KU__US_Num1_Exclamation = 30,
  KU__US_Num2_Atmark,
  KU__US_Num3_Sharp,
  KU__US_Num4_Dollars,
  KU__US_Num5_Percent,
  KU__US_Num6_Circumflex,
  KU__US_Num7_Ampersand,
  KU__US_Num8_Asterisk,
  KU__US_Num9_LeftParenthesis,
  KU__US_Num0_RightParenthesis,

  KU__US_Minus_Undersocre = 45,
  KU__US_Equal_Plus = 46,
  KU__US_LeftSquareBracket_LeftCurlyBrace = 47,
  KU__US_RightSquareBracket_RightCurlyBrace = 48,
  KU__US_Backslash_Verticalbar = 49,
  KU__US_Sharp_Tilde = 50,
  KU__US_Semicolon_Colon = 51,
  KU__US_SingleQuote_DoubleQuote = 52,
  KU__US_BackQuote_Tilde = 53,
  KU__US_Comma_LessThan = 54,
  KU__US_Dot_GreaterThan = 55,
  KU__US_Slash_Question = 56
}

//日本語キーボード向けの定義
const enum HidKeyJP {
  KU__JP_Num1_Exclamation = 30,
  KU__JP_Num2_DoubleQuote,
  KU__JP_Num3_Sharp,
  KU__JP_Num4_Dollars,
  KU__JP_Num5_Percent,
  KU__JP_Num6_Ampersand,
  KU__JP_Num7_SingleQuote,
  KU__JP_Num8_LeftParenthesis,
  KU__JP_Num9_RightParenethesis,
  KU__JP_Num0,

  KU__JP_Minus_Equal = 45,
  KU__JP_Circumflex_Tilde,
  KU__JP_Atmark_BackQuote,

  KU__JP_LeftSquareBracket_LeftCurlyBrace = 48,
  KU__JP_RightSquareBracket_RightCurlyBrace = 49,
  KU__JP_Semicolon_Plus = 51,
  KU__JP_Colon_Asterisk = 52,

  KU_HankakuZenkaku = 53,

  KU__JP_Comma_LessThan = 54,
  KU__JP_Dot_GreaterThan = 55,
  KU__JP_Slash_Question = 56,

  KU__JP_BackSlash_Underscore = 135,
  KU_KatakanaHiragana = 136,
  KU__JP_Yen_VertiacalBar = 137,
  KU_Henkan = 138,
  KU_Muhenkan = 139
}

const OUT_SHIFT = 0x100;
const OUT_NOSHIFT = 0x200;

export const HidKeyCodes = {
  K_Shift: HidKey.KU_Shift,
  K_Ctrl: HidKey.KU_Ctrl,
  K_Alt: HidKey.KU_Alt,
  K_OS: HidKey.KU_Gui,
  K_LShift: HidKey.KU_LShift,
  K_LCtrl: HidKey.KU_LCtrl,
  K_LAlt: HidKey.KU_LAlt,
  K_LOS: HidKey.KU_LGui,
  K_RShift: HidKey.KU_RShift,
  K_RCtrl: HidKey.KU_RCtrl,
  K_RAlt: HidKey.KU_RAlt,
  K_ROS: HidKey.KU_RGui
};

const virutalKeyToHidKeyMapper_Core: {
  [vk in VirtualKey]?: number;
} = {
  //todo: define hid keycodes for all virtualkeys
  K_A: HidKey.KU_A,
  K_B: HidKey.KU_B,
  K_C: HidKey.KU_C,
  K_D: HidKey.KU_D,
  K_E: HidKey.KU_E,
  K_F: HidKey.KU_F,
  K_G: HidKey.KU_G,
  K_H: HidKey.KU_H,
  K_I: HidKey.KU_I,
  K_J: HidKey.KU_J,
  K_K: HidKey.KU_K,
  K_L: HidKey.KU_L,
  K_M: HidKey.KU_M,
  K_N: HidKey.KU_N,
  K_O: HidKey.KU_O,
  K_P: HidKey.KU_P,
  K_Q: HidKey.KU_Q,
  K_R: HidKey.KU_R,
  K_S: HidKey.KU_S,
  K_T: HidKey.KU_T,
  K_U: HidKey.KU_U,
  K_V: HidKey.KU_V,
  K_W: HidKey.KU_W,
  K_X: HidKey.KU_X,
  K_Y: HidKey.KU_Y,
  K_Z: HidKey.KU_Z,
  K_Num_0: HidKey.KU_Num0 | OUT_NOSHIFT,
  K_Num_1: HidKey.KU_Num1 | OUT_NOSHIFT,
  K_Num_2: HidKey.KU_Num2 | OUT_NOSHIFT,
  K_Num_3: HidKey.KU_Num3 | OUT_NOSHIFT,
  K_Num_4: HidKey.KU_Num4 | OUT_NOSHIFT,
  K_Num_5: HidKey.KU_Num5 | OUT_NOSHIFT,
  K_Num_6: HidKey.KU_Num6 | OUT_NOSHIFT,
  K_Num_7: HidKey.KU_Num7 | OUT_NOSHIFT,
  K_Num_8: HidKey.KU_Num8 | OUT_NOSHIFT,
  K_Num_9: HidKey.KU_Num9 | OUT_NOSHIFT,
  K_Escape: HidKey.KU_Escape,
  K_Space: HidKey.KU_Space,
  K_Enter: HidKey.KU_Enter,
  K_Tab: HidKey.KU_Tab,
  K_BackSpace: HidKey.KU_BackSpace,
  K_F1: HidKey.KU_F1,
  K_F2: HidKey.KU_F2,
  K_F3: HidKey.KU_F3,
  K_F4: HidKey.KU_F4,
  K_F5: HidKey.KU_F5,
  K_F6: HidKey.KU_F6,
  K_F7: HidKey.KU_F7,
  K_F8: HidKey.KU_F8,
  K_F9: HidKey.KU_F9,
  K_F10: HidKey.KU_F10,
  K_F11: HidKey.KU_F11,
  K_F12: HidKey.KU_F12,
  K_Shift: HidKey.KU_Shift,
  K_Ctrl: HidKey.KU_Ctrl,
  K_Alt: HidKey.KU_Alt,
  K_OS: HidKey.KU_Gui,
  K_LShift: HidKey.KU_LShift,
  K_LCtrl: HidKey.KU_LCtrl,
  K_LAlt: HidKey.KU_LAlt,
  K_LOS: HidKey.KU_LGui,
  K_RShift: HidKey.KU_RShift,
  K_RCtrl: HidKey.KU_RCtrl,
  K_RAlt: HidKey.KU_RAlt,
  K_ROS: HidKey.KU_RGui,
  K_Home: HidKey.KU_Home,
  K_End: HidKey.KU_End,
  K_Insert: HidKey.KU_Insert,
  K_Delete: HidKey.KU_Delete,
  K_PageUp: HidKey.KU_PageUp,
  K_PageDn: HidKey.KU_PageDown,
  K_LeftArrow: HidKey.KU_LeftArrow,
  K_RightArrow: HidKey.KU_RightArrow,
  K_UpArrow: HidKey.KU_UpArrow,
  K_DownArrow: HidKey.KU_DownArrow,
  K_HankakuZenkaku: HidKeyJP.KU_HankakuZenkaku,
  K_KatakanaHiragana: HidKeyJP.KU_KatakanaHiragana,
  K_Henkan: HidKeyJP.KU_Henkan,
  K_Muhenkan: HidKeyJP.KU_Muhenkan
};

const virutalKeyToHidKeyMapper_US: {
  [vk in VirtualKey]?: number;
} = {
  K_Dot: HidKeyUS.KU__US_Dot_GreaterThan | OUT_NOSHIFT,
  K_Comma: HidKeyUS.KU__US_Comma_LessThan | OUT_NOSHIFT,
  K_Exclamation: HidKeyUS.KU__US_Num1_Exclamation | OUT_SHIFT,
  K_Question: HidKeyUS.KU__US_Slash_Question | OUT_SHIFT,
  K_Colon: HidKeyUS.KU__US_Semicolon_Colon | OUT_SHIFT,
  K_Semicolon: HidKeyUS.KU__US_Semicolon_Colon | OUT_NOSHIFT,
  K_Underscore: HidKeyUS.KU__US_Minus_Undersocre | OUT_SHIFT,
  K_Plus: HidKeyUS.KU__US_Equal_Plus | OUT_SHIFT,
  K_Minus: HidKeyUS.KU__US_Minus_Undersocre | OUT_NOSHIFT,
  K_Asterisk: HidKeyUS.KU__US_Num8_Asterisk | OUT_SHIFT,
  K_Slash: HidKeyUS.KU__US_Slash_Question | OUT_NOSHIFT,
  K_Equal: HidKeyUS.KU__US_Equal_Plus | OUT_NOSHIFT,
  K_Ampersand: HidKeyUS.KU__US_Num7_Ampersand | OUT_SHIFT,
  K_VerticalBar: HidKeyUS.KU__US_Backslash_Verticalbar | OUT_SHIFT,
  K_Hat: HidKeyUS.KU__US_Num6_Circumflex | OUT_SHIFT,
  K_Tilde: HidKeyUS.KU__US_BackQuote_Tilde | OUT_SHIFT,
  K_AtMark: HidKeyUS.KU__US_Num2_Atmark | OUT_SHIFT,
  K_Sharp: HidKeyUS.KU__US_Num3_Sharp | OUT_SHIFT,
  K_Dollar: HidKeyUS.KU__US_Num4_Dollars | OUT_SHIFT,
  K_Yen: HidKeyUS.KU__US_Backslash_Verticalbar | OUT_NOSHIFT,
  K_Percent: HidKeyUS.KU__US_Num5_Percent | OUT_SHIFT,
  K_BackSlash: HidKeyUS.KU__US_Backslash_Verticalbar | OUT_NOSHIFT,
  K_SingleQuote: HidKeyUS.KU__US_SingleQuote_DoubleQuote | OUT_NOSHIFT,
  K_DoubleQuote: HidKeyUS.KU__US_SingleQuote_DoubleQuote | OUT_SHIFT,
  K_BackQuote: HidKeyUS.KU__US_BackQuote_Tilde | OUT_NOSHIFT,
  K_LeftParenthesis: HidKeyUS.KU__US_Num9_LeftParenthesis | OUT_SHIFT,
  K_RightParenthesis: HidKeyUS.KU__US_Num0_RightParenthesis | OUT_SHIFT,
  K_LeftSquareBracket:
    HidKeyUS.KU__US_LeftSquareBracket_LeftCurlyBrace | OUT_NOSHIFT,
  K_RightSquareBracket:
    HidKeyUS.KU__US_RightSquareBracket_RightCurlyBrace | OUT_NOSHIFT,
  K_LeftCurlyBrace:
    HidKeyUS.KU__US_LeftSquareBracket_LeftCurlyBrace | OUT_SHIFT,
  K_RightCurlyBrace:
    HidKeyUS.KU__US_RightSquareBracket_RightCurlyBrace | OUT_SHIFT,
  K_LessThan: HidKeyUS.KU__US_Comma_LessThan | OUT_SHIFT,
  K_GreaterThan: HidKeyUS.KU__US_Dot_GreaterThan | OUT_SHIFT
};

const virutalKeyToHidKeyMapper_JP: {
  [vk in VirtualKey]?: number;
} = {
  K_Dot: HidKeyJP.KU__JP_Dot_GreaterThan | OUT_NOSHIFT,
  K_Comma: HidKeyJP.KU__JP_Comma_LessThan | OUT_NOSHIFT,
  K_Exclamation: HidKeyJP.KU__JP_Num1_Exclamation | OUT_SHIFT,
  K_Question: HidKeyJP.KU__JP_Slash_Question | OUT_SHIFT,
  K_Colon: HidKeyJP.KU__JP_Colon_Asterisk | OUT_NOSHIFT,
  K_Semicolon: HidKeyJP.KU__JP_Semicolon_Plus | OUT_NOSHIFT,
  K_Underscore: HidKeyJP.KU__JP_BackSlash_Underscore | OUT_SHIFT,
  K_Plus: HidKeyJP.KU__JP_Semicolon_Plus | OUT_SHIFT,
  K_Minus: HidKeyJP.KU__JP_Minus_Equal | OUT_NOSHIFT,
  K_Asterisk: HidKeyJP.KU__JP_Colon_Asterisk | OUT_SHIFT,
  K_Slash: HidKeyJP.KU__JP_Slash_Question | OUT_NOSHIFT,
  K_Equal: HidKeyJP.KU__JP_Minus_Equal | OUT_SHIFT,
  K_Ampersand: HidKeyJP.KU__JP_Num6_Ampersand | OUT_SHIFT,
  K_VerticalBar: HidKeyJP.KU__JP_Yen_VertiacalBar | OUT_SHIFT,
  K_Hat: HidKeyJP.KU__JP_Circumflex_Tilde | OUT_NOSHIFT,
  K_Tilde: HidKeyJP.KU__JP_Circumflex_Tilde | OUT_SHIFT,
  K_AtMark: HidKeyJP.KU__JP_Atmark_BackQuote | OUT_NOSHIFT,
  K_Sharp: HidKeyJP.KU__JP_Num3_Sharp | OUT_SHIFT,
  K_Dollar: HidKeyJP.KU__JP_Num4_Dollars | OUT_SHIFT,
  K_Yen: HidKeyJP.KU__JP_Yen_VertiacalBar | OUT_NOSHIFT,
  K_Percent: HidKeyJP.KU__JP_Num5_Percent | OUT_SHIFT,
  K_BackSlash: HidKeyJP.KU__JP_BackSlash_Underscore | OUT_NOSHIFT,
  K_SingleQuote: HidKeyJP.KU__JP_Num7_SingleQuote | OUT_SHIFT,
  K_DoubleQuote: HidKeyJP.KU__JP_Num2_DoubleQuote | OUT_SHIFT,
  K_BackQuote: HidKeyJP.KU__JP_Atmark_BackQuote | OUT_SHIFT,
  K_LeftParenthesis: HidKeyJP.KU__JP_Num8_LeftParenthesis | OUT_SHIFT,
  K_RightParenthesis: HidKeyJP.KU__JP_Num9_RightParenethesis | OUT_SHIFT,
  K_LeftSquareBracket:
    HidKeyJP.KU__JP_LeftSquareBracket_LeftCurlyBrace | OUT_NOSHIFT,
  K_RightSquareBracket:
    HidKeyJP.KU__JP_RightSquareBracket_RightCurlyBrace | OUT_NOSHIFT,
  K_LeftCurlyBrace:
    HidKeyJP.KU__JP_LeftSquareBracket_LeftCurlyBrace | OUT_SHIFT,
  K_RightCurlyBrace:
    HidKeyJP.KU__JP_RightSquareBracket_RightCurlyBrace | OUT_SHIFT,
  K_LessThan: HidKeyJP.KU__JP_Comma_LessThan | OUT_SHIFT,
  K_GreaterThan: HidKeyJP.KU__JP_Dot_GreaterThan | OUT_SHIFT
};

export function getHidKeyCodeEx(
  vk: VirtualKey,
  layout: IKeyboardLayoutStandard
): number {
  if (layout === 'US') {
    return (
      virutalKeyToHidKeyMapper_Core[vk] || virutalKeyToHidKeyMapper_US[vk] || 0
    );
  } else {
    return (
      virutalKeyToHidKeyMapper_Core[vk] || virutalKeyToHidKeyMapper_JP[vk] || 0
    );
  }
}
