import {
  createDictionaryFromKeyValues,
  minusOneToUndefined,
  undefinedToMinusOne,
} from '@shared';
import {
  IEditKeyboardDesign,
  IKeyboardDesign,
} from '@ui-layouter/editor/store/DataSchema';

// groupId: string, ('0', '1', '2', など) 無効値は''
// groupIndex: number | undefined, 無効値はundefined

function groupIndexToGroupId(value: number | undefined) {
  return value !== undefined ? value.toString() : '';
}
function groupIdToGroupIndex(numberStr: string): number | undefined {
  return numberStr ? parseInt(numberStr, 10) : undefined;
}

export namespace KeyboardDesignConverter {
  export function convertKeyboardDesignNonEditToEdit(
    source: IKeyboardDesign,
  ): IEditKeyboardDesign {
    return {
      placementUnit: source.placementUnit,
      placementAnchor: source.placementAnchor,
      keySizeUnit: source.keySizeUnit,
      keyEntities: createDictionaryFromKeyValues(
        source.keyEntities.map((ke, idx) => {
          const { keyId, x, y, angle, shape } = ke;
          const keyIndex = undefinedToMinusOne(ke.keyIndex);
          const groupId = groupIndexToGroupId(ke.groupIndex);
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
              points: shape.points.map(({ x, y }) => ({ x, y })),
              groupId: groupIndexToGroupId(shape.groupIndex),
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

  export function convertKeyboardDesignEditToNonEdit(
    design: IEditKeyboardDesign,
  ): IKeyboardDesign {
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
        groupIndex: groupIdToGroupIndex(ke.groupId),
      })),
      outlineShapes: Object.values(design.outlineShapes).map((shape) => ({
        points: shape.points.map((p) => ({ x: p.x, y: p.y })),
        groupIndex: groupIdToGroupIndex(shape.groupId),
      })),
      transGroups: Object.values(design.transGroups).map((group) => ({
        x: group.x,
        y: group.y,
        angle: group.angle,
      })),
    };
  }
}
