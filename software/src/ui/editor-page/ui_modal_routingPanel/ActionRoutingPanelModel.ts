import { routerConstants, VirtualKey, VirtualKeyTexts } from '~/shared';
import { ISelectorOption, ISelectorOptionN } from '~/ui/common';

const optionVirtualKeys: VirtualKey[] = [
  'K_NONE',
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

  'K_CapsLock',
  'K_PrintScreen',
  'K_HankakuZenkaku',
  'K_KatakanaHiragana',
  'K_Henkan',
  'K_Muhenkan',

  'K_Shift',
  'K_Ctrl',
  'K_Alt',
  'K_Gui',
];

const virtualKeyOptionsBase: ISelectorOption[] = optionVirtualKeys.map(
  (vk) => ({
    value: vk,
    label: VirtualKeyTexts[vk]!,
    // label: vk === 'K_NONE' ? '--' : VirtualKeyTexts[vk]!,
  }),
);

const exOptionsForSource: ISelectorOption[] = [
  { value: 'K_RoutingSource_Any', label: 'any' },
];

const exOptionsForDestination: ISelectorOption[] = [
  { value: 'K_RoutingDestination_Keep', label: 'keep' },
];

export function getRoutingTargetKeyOptions(
  target: 'source' | 'dest',
): ISelectorOption[] {
  return target === 'source'
    ? [...virtualKeyOptionsBase, ...exOptionsForSource]
    : [...virtualKeyOptionsBase, ...exOptionsForDestination];
}

export function getRoutingChannelOptions(): ISelectorOptionN[] {
  return [
    { value: 0, label: 'Main' },
    { value: 1, label: 'Alter' },
    { value: routerConstants.RoutingChannelValueAny, label: 'any' },
  ];
}

const fCtrl = 1;
const fShift = 2;
const fAlt = 4;
const fGui = 8;
const vAny = routerConstants.ModifierSourceValueAny;
const vKeep = routerConstants.ModifierDestinationValueKeep;

const modifiersOptionsBase: ISelectorOptionN[] = [
  { value: 0, label: 'None' },

  { value: fShift, label: 'Shift' },
  { value: fCtrl, label: 'Ctrl' },
  { value: fAlt, label: 'Alt' },
  { value: fGui, label: 'Gui' },

  { value: fShift | fCtrl, label: 'S+C' },
  { value: fShift | fAlt, label: 'S+A' },
  { value: fShift | fGui, label: 'S+G' },
  { value: fCtrl | fAlt, label: 'C+A' },
  { value: fCtrl | fGui, label: 'C+G' },
  { value: fAlt | fGui, label: 'A+G' },

  { value: fShift | fCtrl | fAlt, label: 'S+C+A' },
  { value: fShift | fCtrl | fGui, label: 'S+C+G' },
  { value: fShift | fAlt | fGui, label: 'S+A+G' },
  { value: fCtrl | fAlt | fGui, label: 'C+A+G' },

  { value: fShift | fCtrl | fAlt | fGui, label: 'S+C+A+G' },
];

const optionAny: ISelectorOptionN = { value: vAny, label: 'Any' };

const optionKeep: ISelectorOptionN = { value: vKeep, label: 'Keep' };

export function getRoutingTargetModifierOptions(
  target: 'source' | 'dest',
): ISelectorOptionN[] {
  const options =
    target === 'source'
      ? [...modifiersOptionsBase, optionAny]
      : [...modifiersOptionsBase, optionKeep];
  const optionsMod = options.map((it) => ({
    value: it.value,
    label: it.label.toLowerCase(),
  }));
  return optionsMod;
}
