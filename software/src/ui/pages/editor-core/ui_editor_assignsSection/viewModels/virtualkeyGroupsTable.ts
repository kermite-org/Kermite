import { VirtualKey } from '~/shared';

// const assignKeysGroup00: VirtualKey[] = ['K_NONE'];

const assignKeysGroup0: VirtualKey[] = [
  'K_A',
  'K_B',
  'K_C',
  'K_D',
  'K_E',
  'K_F',
  'K_G',
  'K_H',
  'K_I',
  'K_J',
  'K_K',
  'K_L',
  'K_M',
  'K_N',
  'K_O',
  'K_P',
  'K_Q',
  'K_R',
  'K_S',
  'K_T',
  'K_U',
  'K_V',
  'K_W',
  'K_X',
  'K_Y',
  'K_Z',
];

const assignKeysGroup1: VirtualKey[] = [
  'K_Num_0',
  'K_Num_1',
  'K_Num_2',
  'K_Num_3',
  'K_Num_4',
  'K_Num_5',
  'K_Num_6',
  'K_Num_7',
  'K_Num_8',
  'K_Num_9',
];

const assignKeysGroup2: VirtualKey[] = [
  'K_F1',
  'K_F2',
  'K_F3',
  'K_F4',
  'K_F5',
  'K_F6',
  'K_F7',
  'K_F8',
  'K_F9',
  'K_F10',
  'K_F11',
  'K_F12',
];

const assignKeysGroup3: VirtualKey[] = [
  'K_Dot',
  'K_Comma',
  'K_Semicolon',
  'K_Colon',
  'K_Exclamation',
  'K_Question',

  'K_Underscore',

  'K_Plus',
  'K_Minus',
  'K_Asterisk',
  'K_Slash',
  'K_Equal',

  'K_Ampersand',
  'K_VerticalBar',
  'K_Hat',
  'K_Tilde',

  'K_AtMark',
  'K_Sharp',
  'K_Dollar',
  'K_Yen',
  'K_Percent',
  'K_BackSlash',

  'K_SingleQuote',
  'K_DoubleQuote',
  'K_BackQuote',

  'K_LeftParenthesis',
  'K_RightParenthesis',
  'K_LeftSquareBracket',
  'K_RightSquareBracket',
  'K_LeftCurlyBrace',
  'K_RightCurlyBrace',
  'K_LessThan',
  'K_GreaterThan',
];

const assignKeysGroup4: VirtualKey[] = [
  'K_Space',
  'K_Enter',
  'K_Tab',
  'K_BackSpace',
  'K_Escape',

  'K_LeftArrow',
  'K_RightArrow',
  'K_UpArrow',
  'K_DownArrow',
  'K_Home',
  'K_End',
  'K_PageUp',
  'K_PageDn',
  'K_Insert',
  'K_Delete',
];

const assignKeysGroup5: VirtualKey[] = [
  'K_CapsLock',
  'K_PrintScreen',
  'K_HankakuZenkaku',
  'K_KatakanaHiragana',
  'K_Henkan',
  'K_Muhenkan',
  'K_Lang2Eisu',
  'K_Lang1Kana',
];

const assignKeysGroup6: VirtualKey[] = ['K_Shift', 'K_Ctrl', 'K_Alt', 'K_Gui'];

const assignKeysGroup7: VirtualKey[] = [
  'K_NN',
  'K_UU',
  'K_LTU',
  'K_NextDouble',
  'K_PostDouble',
];

const assignKeysGroup8: VirtualKey[] = [
  'K_NumPad_0',
  'K_NumPad_1',
  'K_NumPad_2',
  'K_NumPad_3',
  'K_NumPad_4',
  'K_NumPad_5',
  'K_NumPad_6',
  'K_NumPad_7',
  'K_NumPad_8',
  'K_NumPad_9',
  'K_NumPad_Dot',
  'K_NumPad_Plus',
  'K_NumPad_Minus',
  'K_NumPad_Asterisk',
  'K_NumPad_Slash',
  'K_NumPad_Equal',
  'K_NumPad_Enter',
  'K_NumPad_BackSpace',
  'K_NumPad_00',
  'K_NumLock',
  'K_CapsLock',
  'K_ScrollLock',
  'K_PauseBreak',
  'K_Menu',
  'K_F13',
  'K_F14',
  'K_F15',
  'K_F16',
  'K_F17',
  'K_F18',
  'K_F19',
  'K_F20',
  'K_F21',
  'K_F22',
  'K_F23',
  'K_F24',
  'K_LShift',
  'K_LCtrl',
  'K_LAlt',
  'K_LGui',
  'K_RShift',
  'K_RCtrl',
  'K_RAlt',
  'K_RGui',
];

export const virtualKeyGroupsTable: VirtualKey[][] = [
  assignKeysGroup0,
  assignKeysGroup1,
  assignKeysGroup2,
  assignKeysGroup3,
  assignKeysGroup4,
  assignKeysGroup5,
  assignKeysGroup6,
  assignKeysGroup7,
];

export const virtualKeyGroupsTable2: VirtualKey[][] = [
  [...assignKeysGroup0, ...assignKeysGroup1],
  [...assignKeysGroup3],
  assignKeysGroup4,
  [...assignKeysGroup2, ...assignKeysGroup6],
  assignKeysGroup5,
  // assignKeysGroup7
];

export const virtualKeyGroupsTable3: VirtualKey[][] = [assignKeysGroup8];
