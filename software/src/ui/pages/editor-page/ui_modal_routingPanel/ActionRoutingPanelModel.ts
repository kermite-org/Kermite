import {
  routerConstants,
  routingOptionVirtualKeys,
  VirtualKeyTexts,
} from '~/shared';
import { ISelectorOption, ISelectorOptionN } from '~/ui/base';

const virtualKeyOptionsBase: ISelectorOption[] = routingOptionVirtualKeys.map(
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
  { value: fGui, label: 'OS' },

  { value: fShift | fCtrl, label: 'Shift+Ctrl' },
  { value: fShift | fAlt, label: 'Shit+Alt' },
  { value: fShift | fGui, label: 'Shift+OS' },
  { value: fCtrl | fAlt, label: 'Ctrl+Alt' },
  { value: fCtrl | fGui, label: 'Ctrl+OS' },
  { value: fAlt | fGui, label: 'Alt+OS' },

  { value: fShift | fCtrl | fAlt, label: 'Shift+Ctrl+Alt' },
  { value: fShift | fCtrl | fGui, label: 'Shift+Ctrl+OS' },
  { value: fShift | fAlt | fGui, label: 'Shift+Alt+OS' },
  { value: fCtrl | fAlt | fGui, label: 'Ctrl+Alt+OS' },

  { value: fShift | fCtrl | fAlt | fGui, label: 'Shift+Ctrl+Alt+OS' },
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
