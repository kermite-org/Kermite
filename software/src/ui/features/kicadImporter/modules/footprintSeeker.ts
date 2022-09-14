import { countArrayItemsMatched } from '~/shared';
import { IPcbShapeData } from '../base';

export function footprintSeeker_findDefaultFootprintSearchWord(
  pcbShapeData: IPcbShapeData,
): string {
  const { footprints } = pcbShapeData;
  const candidateWords = [
    'cherry',
    'mx',
    'choc',
    'kailh',
    'key',
    'switch',
    'socket',
  ];
  const numMatched = candidateWords.map((word) =>
    countArrayItemsMatched(footprints, (it) =>
      it.footprintName.toLowerCase().includes(word),
    ),
  );
  if (numMatched.every((it) => it === 0)) {
    return '';
  }
  const wordIndex = numMatched.indexOf(Math.max(...numMatched));
  return candidateWords[wordIndex];
}
