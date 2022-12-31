import { ISelectorOption } from '~/app-shared';

export type IGridSpec =
  | { unit: 'mm'; pitch: number }
  | { unit: 'KP'; division: number };

export type IGridSpecKey =
  | 'kp_div1'
  | 'kp_div2'
  | 'kp_div4'
  | 'kp_div8'
  | 'kp_div16'
  | 'mm_pitch10'
  | 'mm_pitch5'
  | 'mm_pitch2'
  | 'mm_pitch1'
  | 'mm_pitch05';

const gridPitchSelectionKeys: IGridSpecKey[] = [
  'kp_div1',
  'kp_div2',
  'kp_div4',
  'kp_div8',
  'kp_div16',
  'mm_pitch10',
  'mm_pitch5',
  'mm_pitch2',
  'mm_pitch1',
  'mm_pitch05',
];

const gridPitchSelectionDisplayTexts: {
  [key in IGridSpecKey]: string;
} = {
  kp_div1: '1/1 KP',
  kp_div2: '1/2 KP',
  kp_div4: '1/4 KP',
  kp_div8: '1/8 KP',
  kp_div16: '1/16 KP',
  mm_pitch10: '10mm',
  mm_pitch5: '5mm',
  mm_pitch2: '2mm',
  mm_pitch1: '1mm',
  mm_pitch05: '0.5mm',
};

export const gridPitchSelectorOptions: ISelectorOption[] =
  gridPitchSelectionKeys.map((key) => ({
    value: key,
    label: gridPitchSelectionDisplayTexts[key],
  }));

export const gridPitchSelectorDefaultValue: IGridSpecKey = 'kp_div4';

const gridPitchSelectionKeyToGridSpecValuesTable: {
  [key in IGridSpecKey]: IGridSpec;
} = {
  kp_div1: { unit: 'KP', division: 1 },
  kp_div2: { unit: 'KP', division: 2 },
  kp_div4: { unit: 'KP', division: 4 },
  kp_div8: { unit: 'KP', division: 8 },
  kp_div16: { unit: 'KP', division: 16 },
  mm_pitch10: { unit: 'mm', pitch: 10 },
  mm_pitch5: { unit: 'mm', pitch: 5 },
  mm_pitch2: { unit: 'mm', pitch: 2 },
  mm_pitch1: { unit: 'mm', pitch: 1 },
  mm_pitch05: { unit: 'mm', pitch: 0.5 },
};

export function decodeGridSpec(key: IGridSpecKey): IGridSpec {
  return gridPitchSelectionKeyToGridSpecValuesTable[key];
}
