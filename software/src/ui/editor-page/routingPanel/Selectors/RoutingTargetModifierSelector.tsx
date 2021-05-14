import { FC, jsx } from 'qx';
import { ISelectorOptionN } from '~/ui/common';
import { GeneralSelectorN } from '~/ui/common/components/atoms/GeneralSelectorN';

type Props = {
  value: number;
  onChange: (newValue: number) => void;
  target: 'source' | 'dest';
};

const fShift = 1;
const fCtrl = 2;
const fAlt = 4;
const fGui = 8;
const vAny = 255;
const vKeep = 254;

const optionsBase: ISelectorOptionN[] = [
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

export const RoutingTargetModifierSelector: FC<Props> = ({
  value,
  onChange,
  target,
}) => {
  const options =
    target === 'source'
      ? [...optionsBase, optionAny]
      : [...optionsBase, optionKeep];

  const optionsMod = options.map((it) => ({
    value: it.value,
    label: it.label.toLowerCase(),
  }));
  return (
    <GeneralSelectorN options={optionsMod} value={value} setValue={onChange} />
  );
};
