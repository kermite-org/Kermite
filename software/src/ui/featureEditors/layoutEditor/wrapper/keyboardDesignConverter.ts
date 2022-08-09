import {
  createDictionaryFromKeyValues,
  IPersistKeyboardDesign,
  flattenArray,
  IPersistKeyboardDesignRealKeyEntity,
  IPersistKeyboardDesignMirrorKeyEntity,
  convertDefaultValueToUndefined,
  convertUndefinedToDefaultValue,
} from '~/shared';
import {
  IEditKeyboardDesign,
  IEditKeyEntity,
} from '~/ui/featureEditors/layoutEditor/models';
import { getKeyIdentifierText } from '~/ui/featureEditors/layoutEditor/models/domainRelatedHelpers';

// groupId: string, ('0', '1', '2', など) 無効値は''
// groupIndex: number | undefined, 無効値はundefined

function groupIndexToGroupId(value: number | undefined) {
  return value !== undefined ? value.toString() : '';
}
function groupIdToGroupIndex(numberStr: string): number | undefined {
  return numberStr ? parseInt(numberStr, 10) : undefined;
}

function roundNumber(value: number) {
  const sc = 10000;
  return Math.round(value * sc) / sc;
}

export namespace KeyboardDesignConverter {
  type IRealKeyEntity = IPersistKeyboardDesignRealKeyEntity;
  type IMirrorKeyEntity = IPersistKeyboardDesignMirrorKeyEntity;

  export function convertKeyboardDesignPersistToEdit(
    source: IPersistKeyboardDesign,
  ): IEditKeyboardDesign {
    const realKeys = source.keyEntities.filter(
      (ke) => !('mirrorOf' in ke),
    ) as IRealKeyEntity[];
    const mirrorKeys = source.keyEntities.filter(
      (ke) => 'mirrorOf' in ke,
    ) as IMirrorKeyEntity[];

    const keyEntitiesSource = realKeys.map((ke, idx) => {
      const base: IEditKeyEntity = {
        id: `ke!${idx}`,
        editKeyId: ke.keyId,
        mirrorEditKeyId: ke.keyId + 'm',
        x: ke.x,
        y: ke.y,
        angle: convertUndefinedToDefaultValue(ke.angle, 0),
        shape: convertUndefinedToDefaultValue(ke.shape, 'std 1'),
        keyIndex: convertUndefinedToDefaultValue(ke.keyIndex, -1),
        mirrorKeyIndex: -1,
        groupId: groupIndexToGroupId(ke.groupIndex),
      };
      const mirroredKey = mirrorKeys.find((mke) => mke.mirrorOf === ke.keyId);
      if (mirroredKey) {
        base.mirrorEditKeyId = mirroredKey.keyId;
        base.mirrorKeyIndex = convertUndefinedToDefaultValue(
          mirroredKey.keyIndex,
          -1,
        );
      }
      return base;
    });

    return {
      setup: {
        placementUnit: source.setup.placementUnit,
        placementAnchor: source.setup.placementAnchor,
        keySizeUnit: source.setup.keySizeUnit,
        keyIdMode: source.setup.keyIdMode,
      },
      keyEntities: createDictionaryFromKeyValues(
        keyEntitiesSource.map((ke) => [ke.id, ke]),
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
      extraShape: source.extraShape || { path: '', x: 0, y: 0, scale: 1 },
      transGroups: createDictionaryFromKeyValues(
        source.transformationGroups.map((group, idx) => {
          const id = idx.toString();
          return [
            id,
            {
              id,
              x: group.x,
              y: group.y,
              angle: convertUndefinedToDefaultValue(group.angle, 0),
              mirror: group.mirror || false,
            },
          ];
        }),
      ),
    };
  }

  export function convertKeyboardDesignEditToPersist(
    design: IEditKeyboardDesign,
  ): IPersistKeyboardDesign {
    return {
      formatRevision: 'LA01',
      setup: {
        placementUnit: design.setup.placementUnit,
        placementAnchor: design.setup.placementAnchor,
        keySizeUnit: design.setup.keySizeUnit,
        keyIdMode: design.setup.keyIdMode,
      },
      keyEntities: flattenArray(
        Object.values(design.keyEntities).map((ke) => {
          const isManualKeyIdMode = design.setup.keyIdMode === 'manual';
          const group = design.transGroups[ke.groupId];

          const realKeyId = getKeyIdentifierText(ke, false, isManualKeyIdMode);
          const mirroredKeyId = getKeyIdentifierText(
            ke,
            true,
            isManualKeyIdMode,
          );

          const realKeyEntity = {
            keyId: realKeyId,
            x: roundNumber(ke.x),
            y: roundNumber(ke.y),
            angle: convertDefaultValueToUndefined(roundNumber(ke.angle), 0),
            shape: convertDefaultValueToUndefined(ke.shape, 'std 1'),
            keyIndex: convertDefaultValueToUndefined(ke.keyIndex, -1),
            groupIndex: groupIdToGroupIndex(ke.groupId),
          };

          const mirroredKeyEntity =
            (group?.mirror && {
              keyId: mirroredKeyId,
              mirrorOf: realKeyId,
              keyIndex: convertDefaultValueToUndefined(ke.mirrorKeyIndex, -1),
            }) ||
            undefined;

          return mirroredKeyEntity
            ? [realKeyEntity, mirroredKeyEntity]
            : [realKeyEntity];
        }),
      ).sort((a, b) => {
        const isAMirror = 'mirrorOf' in a;
        const isBMirror = 'mirrorOf' in b;
        if (!isAMirror && isBMirror) {
          return -1;
        }
        if (isAMirror && !isBMirror) {
          return 1;
        }
        return 0;
      }),
      outlineShapes: Object.values(design.outlineShapes).map((shape) => ({
        points: shape.points.map((p) => ({
          x: roundNumber(p.x),
          y: roundNumber(p.y),
        })),
        groupIndex: groupIdToGroupIndex(shape.groupId),
      })),
      extraShape: design.extraShape.path ? design.extraShape : undefined,
      transformationGroups: Object.values(design.transGroups).map((group) => ({
        x: roundNumber(group.x),
        y: roundNumber(group.y),
        angle: convertDefaultValueToUndefined(roundNumber(group.angle), 0),
        mirror: group.mirror || undefined,
      })),
    };
  }
}
