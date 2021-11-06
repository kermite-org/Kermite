import {
  PartialRecord,
  SystemAction,
  systemActionToLabelTextMap,
} from '~/shared';
import { languageKey } from '~/ui/base';

const systemActionNoteTextsJa: PartialRecord<SystemAction, string> = {
  GlowToggle: 'バックライトのon/offを切り替えます。',
  GlowPatternRoll: 'バックライトのパターンを切り替えます。',
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

const systemActionNoteTexts =
  languageKey === 'english' ? systemActionNoteTextsEn : systemActionNoteTextsJa;

export function getSystemActionNote(sa: SystemAction): string {
  if (systemActionNoteTexts[sa]) {
    return `${systemActionToLabelTextMap[sa]}: ${systemActionNoteTexts[sa]}`;
  }
  return '';
}
