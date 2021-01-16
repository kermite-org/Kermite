import {
  blankStringToUndefined,
  createDictionaryFromKeyValues,
  minusOneToUndefined,
  undefinedToBlankString,
  undefinedToMinusOne,
} from '@shared';
import {
  IKeyboardDesign,
  IPersistentKeyboardDesign,
} from '@ui-layouter/editor/store/DataSchema';

export namespace LayouterPersistDataConverter {
  export function convertFromPersistData(
    source: IPersistentKeyboardDesign,
  ): IKeyboardDesign {
    return {
      placementUnit: source.placementUnit,
      placementAnchor: source.placementAnchor,
      keySizeUnit: source.keySizeUnit,
      keyEntities: createDictionaryFromKeyValues(
        source.keyEntities.map((ke, idx) => {
          const { keyId, x, y, angle, shape } = ke;
          const keyIndex = undefinedToMinusOne(ke.keyIndex);
          const groupId = undefinedToBlankString(ke.groupId);
          const id = `ke!${idx}`;
          return [id, { id, keyId, x, y, angle, shape, keyIndex, groupId }];
        }),
      ),
      outlineShapes: createDictionaryFromKeyValues(
        source.outlineShapes.map((shape, idx) => {
          const id = `shape!${idx}`;
          return [
            id,
            {
              id,
              points: shape.points.map(([x, y]) => ({ x, y })),
              groupId: undefinedToBlankString(shape.groupId),
            },
          ];
        }),
      ),
      transGroups: createDictionaryFromKeyValues(
        source.transGroups.map((group, idx) => {
          const id = idx.toString();
          return [id, { ...group, id }];
        }),
      ),
    };
  }

  export function convertToPersistData(
    design: IKeyboardDesign,
  ): IPersistentKeyboardDesign {
    return {
      placementUnit: design.placementUnit,
      placementAnchor: design.placementAnchor,
      keySizeUnit: design.keySizeUnit,
      keyEntities: Object.values(design.keyEntities).map((ke) => ({
        keyId: ke.keyId,
        x: ke.x,
        y: ke.y,
        angle: ke.angle,
        shape: ke.shape,
        keyIndex: minusOneToUndefined(ke.keyIndex),
        groupId: blankStringToUndefined(ke.groupId),
      })),
      outlineShapes: Object.values(design.outlineShapes).map((shape) => ({
        points: shape.points.map((p) => [p.x, p.y]),
        groupId: blankStringToUndefined(shape.groupId),
      })),
      transGroups: Object.values(design.transGroups).map((group) => ({
        x: group.x,
        y: group.y,
        angle: group.angle,
      })),
    };
  }
}
