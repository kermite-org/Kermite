import { IEditKeyEntity } from '~/ui/editors/LayoutEditor/models/DataSchema';

export function getKeyIdentifierText(
  ke: IEditKeyEntity,
  isMirror: boolean,
  isManualKeyIdMode: boolean,
): string {
  if (!isManualKeyIdMode) {
    const keyIndex = isMirror ? ke.mirrorKeyIndex : ke.keyIndex;
    if (keyIndex !== -1) {
      return `key${keyIndex}`;
    } else {
      const index = ke.id.split('!')[1];
      return `key0${index}${isMirror ? 'm' : ''}`;
    }
  } else {
    return isMirror ? ke.mirrorEditKeyId : ke.editKeyId;
  }
}

export function getNextEntityInstanceId<T extends { id: string }>(
  prefix: string,
  entities: T[],
) {
  const allNumbers = entities.map((shape) => parseInt(shape.id.split('!')[1]));
  const newNumber = allNumbers.length > 0 ? Math.max(...allNumbers) + 1 : 0;
  return `${prefix}!${newNumber}`;
}
