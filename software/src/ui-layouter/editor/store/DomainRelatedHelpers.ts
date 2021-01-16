import { IEditKeyEntity } from '@ui-layouter/editor/store/DataSchema';

export function getKeyIdentifierText(
  ke: IEditKeyEntity,
  isMirror: boolean,
  allKeyEntities: IEditKeyEntity[],
): string {
  if (ke) {
    const ki = isMirror ? ke.mirrorKeyIndex : ke.keyIndex;
    if (ki !== -1) {
      return `key${ki}`;
    } else {
      const tmpIndex = allKeyEntities.indexOf(ke);
      return `key0${tmpIndex}${isMirror ? 'm' : ''}`;
    }
  }
  return '';
}
