import { FC, jsx } from 'qx';
import { VirtualKey, VirtualKeyTexts } from '~/shared';
import { GeneralSelector, ISelectorOption } from '~/ui/common';

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

const optionsBase: ISelectorOption[] = optionVirtualKeys.map((vk) => ({
  value: vk,
  label: VirtualKeyTexts[vk]!,
  // label: vk === 'K_NONE' ? '--' : VirtualKeyTexts[vk]!,
}));

const exOptionsForSource: ISelectorOption[] = [
  { value: 'K_RoutingSource_Any', label: 'Any' },
];

const exOptionsForDestination: ISelectorOption[] = [
  { value: 'K_RoutingDestination_Keep', label: 'Keep' },
  { value: 'K_RoutingDestination_Stop', label: 'Stop' },
];

export const RoutingTargetKeySelector: FC<{
  value: VirtualKey;
  onChange: (newValue: VirtualKey) => void;
  target: 'source' | 'dest';
}> = ({ value, onChange, target }) => {
  const options =
    target === 'source'
      ? [...optionsBase, ...exOptionsForSource]
      : [...optionsBase, ...exOptionsForDestination];
  return (
    <GeneralSelector options={options} value={value} setValue={onChange} />
  );
};
