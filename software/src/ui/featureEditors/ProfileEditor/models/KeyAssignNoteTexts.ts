import {
  PartialRecord,
  SystemAction,
  systemActionToLabelTextMap,
  VirtualKey,
  VirtualKeyTexts,
} from '~/shared';
import { languageKey } from '~/ui/base';

const isJapanese = languageKey === 'japanese';

const keyNameTexts: PartialRecord<VirtualKey, string> = {
  K_Escape: 'Escape',
  K_Enter: 'Enter',
  K_Tab: 'Tab',
  K_BackSpace: 'Backspace',
  K_Ctrl: 'Ctrl',
  K_Shift: 'Shift',
  K_Alt: 'Alt',
  K_Gui: 'GUI',
  K_Insert: 'Insert',
  K_Home: 'Home',
  K_PageUp: 'PageUp',
  K_Delete: 'Delete',
  K_End: 'End',
  K_PageDn: 'PageDn',
  K_RightArrow: 'Right Arrow',
  K_LeftArrow: 'Left Arrow',
  K_DownArrow: 'Down Arrow',
  K_UpArrow: 'Up Arrow',
  K_NumLock: 'NumLock',
  K_CapsLock: 'CapsLock',
  K_ScrollLock: 'ScrollLock',
  K_PrintScreen: 'PrintScreen',
  K_PauseBreak: 'Pause',
  K_Menu: 'Menu',
};

const keyNameTextsJa: PartialRecord<VirtualKey, string> = {
  K_RightArrow: '右カーソル',
  K_LeftArrow: '左カーソル',
  K_DownArrow: '下カーソル',
  K_UpArrow: '上カーソル',
  K_KatakanaHiragana: 'カタカナ/ひらがな',
  K_Henkan: '変換',
  K_Muhenkan: '無変換',
  K_HankakuZenkaku: '半角/全角',
  K_LShift: '左Shift',
  K_LCtrl: '左Ctrl',
  K_RShift: '右Shift',
  K_RCtrl: '右Ctrl',
};

const keyNameTextsEn: PartialRecord<VirtualKey, string> = {
  K_KatakanaHiragana: 'カタカナ/ひらがな',
  K_Henkan: '変換',
  K_Muhenkan: '無変換',
  K_HankakuZenkaku: '半角/全角',
  K_LShift: 'Left Shift',
  K_LCtrl: 'Left Ctrl',
  K_LAlt: 'Left Alt',
  K_LGui: 'Left GUI',
  K_RShift: 'Right Shift',
  K_RCtrl: 'Right Ctrl',
  K_RAlt: 'Right Alt',
  K_RGui: 'Right GUI',
};

function getWindowsOrMacTextJa(keyNameWin: string, keyNameMac: string): string {
  return `${keyNameWin}キーを割り当てます。MacOSの場合${keyNameMac}キーに対応します。`;
}

const tenKeyKeyNameTexts: PartialRecord<VirtualKey, string> = {
  K_NumPad_0: '0',
  K_NumPad_1: '1',
  K_NumPad_2: '2',
  K_NumPad_3: '3',
  K_NumPad_4: '4',
  K_NumPad_5: '5',
  K_NumPad_6: '6',
  K_NumPad_7: '7',
  K_NumPad_8: '8',
  K_NumPad_9: '9',
  K_NumPad_Dot: '.',
  K_NumPad_Plus: '+',
  K_NumPad_Minus: '-',
  K_NumPad_Asterisk: '*',
  K_NumPad_Slash: '/',
  K_NumPad_Equal: '=',
  K_NumPad_Enter: 'Enter',
  K_NumPad_BackSpace: 'Backspace',
  K_NumPad_00: '00',
};

const keyAssignNoteTextsJa: PartialRecord<VirtualKey, string> = {
  K_Alt: getWindowsOrMacTextJa('Alt', 'Option'),
  K_Gui: getWindowsOrMacTextJa('Windows', 'Command'),
  K_LAlt: getWindowsOrMacTextJa('左Alt', '左側のOption'),
  K_LGui: getWindowsOrMacTextJa('左Windows', '左側のCommand'),
  K_RAlt: getWindowsOrMacTextJa('右Alt', '右側のOption'),
  K_RGui: getWindowsOrMacTextJa('右Windows', '右側のCommand'),
};

export function getKeyAssignNote(vk: VirtualKey): string {
  if (isJapanese) {
    const overrideText = keyAssignNoteTextsJa[vk];
    if (overrideText) {
      return overrideText;
    }
    const tenKeyKeyName = tenKeyKeyNameTexts[vk];
    if (tenKeyKeyName) {
      return `テンキーの${tenKeyKeyName}を割り当てます。`;
    }
    const keyName =
      keyNameTextsJa[vk] || keyNameTexts[vk] || VirtualKeyTexts[vk] || '';
    return `${keyName}キーを割り当てます。`;
  } else {
    const tenKeyKeyName = tenKeyKeyNameTexts[vk];
    if (tenKeyKeyName) {
      return `Assign ${tenKeyKeyName} key of numpad.`;
    }
    const keyName =
      keyNameTextsEn[vk] || keyNameTexts[vk] || VirtualKeyTexts[vk] || '';
    return `Assign ${keyName} key.`;
  }
}

const systemActionNoteTextsJa: PartialRecord<SystemAction, string> = {
  GlowToggle: 'バックライトのon/offを切り替えます。',
  GlowPatternRoll: 'バックライトの点灯パターンを切り替えます。',
  GlowColorPrev: 'バックライトの色の指定を1つ前に戻します。',
  GlowColorNext: 'バックライトの色の指定を1つ次へ進めます。',
  GlowBrightnessMinus: 'バックライトの明るさを1段階下げます。',
  GlowBrightnessPlus: 'バックライトの明るさを1段階上げます。',
  ResetToDfuMode: 'MCUでソフトウェアリセットを行いブートローダモードにします。',
  SystemLayoutSetPrimary: 'システムレイアウトを英語に切り替えます。',
  SystemLayoutSetSecondary: 'システムレイアウトを日本語に切り替えます。',
  SystemLayoutNext: 'システムレイアウトをトグルで切り替えます。',
  RoutingChannelSetMain: 'ルーティングチャネルをMainチャネルに設定します。',
  RoutingChannelSetAlter: 'ルーティングチャネルをAlterチャネルに設定します。',
  RoutingChannelNext: 'ルーティングチャネルをトグルで切り替えます。',
};

const systemActionNoteTextsEn: PartialRecord<SystemAction, string> = {
  GlowToggle: 'Toggle the backlight on and off.',
  GlowPatternRoll: 'Toggle the backlight pattern.',
  GlowColorPrev: 'Shift the backlight color specification previous.',
  GlowColorNext: 'Shift the backlight color specification next.',
  GlowBrightnessMinus: 'Decrease the brightness of the backlight.',
  GlowBrightnessPlus: 'Increase the brightness of the backlight.',
  ResetToDfuMode: 'Perform a software reset on the MCU to bootloader mode.',
  SystemLayoutSetPrimary: 'Switch the system layout to English.',
  SystemLayoutSetSecondary: 'Switch the system layout to Japanese.',
  SystemLayoutNext: 'Toggle the system layout.',
  RoutingChannelSetMain: 'Set the routing channel to Main.',
  RoutingChannelSetAlter: 'Set the routing channel to Alter.',
  RoutingChannelNext: 'Toggle the routing channel.',
};

const systemActionNoteTexts = isJapanese
  ? systemActionNoteTextsJa
  : systemActionNoteTextsEn;

export function getSystemActionNote(sa: SystemAction): string {
  if (systemActionNoteTexts[sa]) {
    return `${systemActionToLabelTextMap[sa]}: ${systemActionNoteTexts[sa]}`;
  }
  return '';
}
