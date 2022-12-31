import {
  IAssignOperation,
  ILayer,
  VirtualKeyTexts,
  IAssignEntryWithLayerFallback,
  IProfileData,
  systemActionToLabelTextMap,
  IAssignEntry,
  decodeModifierVirtualKeys,
  IProfileSettings,
  consumerControlActionToLabelTextMap,
} from '~/app-shared';

function getAssignOperationText(
  op: IAssignOperation | undefined,
  layers: ILayer[],
): string {
  if (op?.type === 'keyInput') {
    const keyText = VirtualKeyTexts[op.virtualKey] || '';
    if (op.attachedModifiers) {
      const modText = decodeModifierVirtualKeys(op.attachedModifiers)
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
  if (op?.type === 'systemAction') {
    return systemActionToLabelTextMap[op.action] || '';
  }
  if (op?.type === 'consumerControl') {
    return consumerControlActionToLabelTextMap[op.action] || '';
  }
  return '';
}

export function getAssignEntryTexts(
  assign: IAssignEntryWithLayerFallback | undefined,
  layers: ILayer[],
  settings: IProfileSettings,
): {
  primaryText: string;
  secondaryText: string;
  tertiaryText: string;
  isLayerFallback: boolean;
} {
  if (assign) {
    if (assign.type === 'block' || assign.type === 'layerFallbackBlock') {
      return {
        primaryText: '□',
        // primaryTest: '⬡',
        secondaryText: '',
        tertiaryText: '',
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
        tertiaryText: '',
        isLayerFallback: assign.type === 'layerFallbackTransparent',
      };
    }

    if (assign.type === 'single') {
      return {
        primaryText: getAssignOperationText(assign.op, layers),
        secondaryText: '',
        tertiaryText: '',
        isLayerFallback: false,
      };
    }
    if (assign.type === 'dual') {
      let prmText = getAssignOperationText(assign.primaryOp, layers);
      let secText = getAssignOperationText(assign.secondaryOp, layers);
      const terText = getAssignOperationText(assign.tertiaryOp, layers);

      if (
        settings.assignType === 'dual' &&
        settings.secondaryDefaultTrigger === 'down' &&
        !prmText &&
        secText &&
        !terText
      ) {
        prmText = secText;
        secText = '';
      }

      if (assign.tertiaryOp) {
        return {
          primaryText: prmText,
          secondaryText: secText,
          tertiaryText: terText,
          isLayerFallback: false,
        };
      } else {
        return {
          primaryText: prmText,
          secondaryText: secText,
          tertiaryText: '',
          isLayerFallback: false,
        };
      }
    }
  }
  return {
    primaryText: '',
    secondaryText: '',
    tertiaryText: '',
    isLayerFallback: false,
  };
}

export function getAssignForKeyUnitWithLayerFallback(
  keyUnitId: string,
  layerId: string,
  layers: ILayer[],
  assigns: IProfileData['assigns'],
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

export function getAssignForKeyUnitInInitialLayerStack(
  keyUnitId: string,
  layers: ILayer[],
  assigns: IProfileData['assigns'],
): IAssignEntry | undefined {
  const activeLayers = layers.filter((la) => la.initialActive);
  for (const layer of activeLayers) {
    const assign = assigns[`${layer.layerId}.${keyUnitId}`];
    if (assign) {
      return assign;
    }
  }
}
