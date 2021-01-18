import {
  IAssignOperation,
  ILayer,
  VirtualKeyTexts,
  IAssignEntryWithLayerFallback,
  IProfileDataAssigns,
} from '~/shared';

function getAssignOperationText(
  op: IAssignOperation | undefined,
  layers: ILayer[],
): string {
  if (op?.type === 'keyInput') {
    const keyText = VirtualKeyTexts[op.virtualKey] || '';
    if (op.attachedModifiers) {
      const modText = op.attachedModifiers
        .map((m) => VirtualKeyTexts[m]?.charAt(0))
        .join('+');
      return `${modText}+${keyText}`;
    }
    return keyText;
  }
  if (op?.type === 'layerClearExclusive') {
    return 'ex-clear';
  }
  if (op?.type === 'layerCall') {
    const layer = layers.find((la) => la.layerId === op.targetLayerId);
    if (layer && op.invocationMode === 'turnOff') {
      return layer.layerName + '-off';
    }
    return layer?.layerName || '';
  }
  if (op?.type === 'modifierCall') {
    return VirtualKeyTexts[op.modifierKey] || '';
  }
  return '';
}

export function getAssignEntryTexts(
  assign: IAssignEntryWithLayerFallback | undefined,
  layers: ILayer[],
): { primaryText: string; secondaryText: string; isLayerFallback: boolean } {
  if (assign) {
    if (assign.type === 'block' || assign.type === 'layerFallbackBlock') {
      return {
        primaryText: '□',
        // primaryTest: '⬡',
        secondaryText: '',
        isLayerFallback: assign.type === 'layerFallbackBlock',
      };
    }
    if (
      assign.type === 'transparent' ||
      assign.type === 'layerFallbackTransparent'
    ) {
      return {
        primaryText: '↡',
        secondaryText: '',
        isLayerFallback: assign.type === 'layerFallbackTransparent',
      };
    }

    if (assign.type === 'single') {
      return {
        primaryText: getAssignOperationText(assign.op, layers),
        secondaryText: '',
        isLayerFallback: false,
      };
    }
    if (assign.type === 'dual') {
      const prmText = getAssignOperationText(assign.primaryOp, layers);
      const secText = getAssignOperationText(assign.secondaryOp, layers);
      const terText = getAssignOperationText(assign.tertiaryOp, layers);
      if (assign.tertiaryOp) {
        return {
          primaryText: `${prmText} ${terText}`,
          secondaryText: secText,
          isLayerFallback: false,
        };
      } else {
        return {
          primaryText: prmText,
          secondaryText: secText,
          isLayerFallback: false,
        };
      }
    }
  }
  return {
    primaryText: '',
    secondaryText: '',
    isLayerFallback: false,
  };
}

export function getAssignForKeyUnitWithLayerFallback(
  keyUnitId: string,
  layerId: string,
  layers: ILayer[],
  assigns: IProfileDataAssigns,
): IAssignEntryWithLayerFallback | undefined {
  const assign = assigns[`${layerId}.${keyUnitId}`];
  if (!assign) {
    const layer = layers.find((la) => la.layerId === layerId);
    const defaultScheme = layer?.defaultScheme;
    if (defaultScheme === 'transparent') {
      return { type: 'layerFallbackTransparent' };
    }
    if (defaultScheme === 'block') {
      return { type: 'layerFallbackBlock' };
    }
  }
  return assign;
}
