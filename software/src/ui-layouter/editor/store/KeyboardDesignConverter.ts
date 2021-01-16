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
          const id = `ke!${idx}`;
          return [
            id,
            {
              id,
              label: ke.label,
              x: ke.x,
              y: ke.y,
              angle: ke.angle,
              shape: ke.shape,
              keyIndex: undefinedToMinusOne(ke.keyIndex),
              mirrorKeyIndex: undefinedToMinusOne(ke.mirrorKeyIndex),
              groupId: groupIndexToGroupId(ke.groupIndex),
            },
          ];
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
          const { x, y, angle, mirror } = group;
          const id = idx.toString();
          return [id, { x, y, angle, mirror: mirror || false, id }];
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
        label: ke.label,
        x: ke.x,
        y: ke.y,
        angle: ke.angle,
        shape: ke.shape,
        keyIndex: minusOneToUndefined(ke.keyIndex),
        mirrorKeyIndex: minusOneToUndefined(ke.mirrorKeyIndex),
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
        mirror: group.mirror,
      })),
    };
  }
}
