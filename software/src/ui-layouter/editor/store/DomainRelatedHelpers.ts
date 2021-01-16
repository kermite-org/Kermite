import { IEditKeyEntity } from '@ui-layouter/editor/store/DataSchema';

export function getKeyIdentifierText(
  ke: IEditKeyEntity,
  isMirror: boolean,
): string {
  if (ke) {
    const ki = isMirror ? ke.mirrorKeyIndex : ke.keyIndex;
    if (ki !== -1) {
      return `key${ki}`;
    } else {
      const index = ke.id.split('!')[1];
      return `key0${index}${isMirror ? 'm' : ''}`;
    }
  }
  return '';
}

export function getNextEntityInstanceId<T extends { id: string }>(
  prefix: string,
  entities: T[],
) {
  const allNumbers = entities.map((shape) => parseInt(shape.id.split('!')[1]));
  const newNumber = allNumbers.length > 0 ? Math.max(...allNumbers) + 1 : 0;
  return `${prefix}!${newNumber}`;
}
