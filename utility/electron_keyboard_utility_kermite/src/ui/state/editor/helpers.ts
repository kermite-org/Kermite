import { IKeyAssignEntry, ILayer, IEditModel } from '~contract/data';
import { VirtualKey, ModifierVirtualKey } from '~model/HighLevelDefs';
import { AssignCategory } from './editorSlice';

export function getAssignSlotAddress(
  keyUnitId: string,
  layerId: string,
  isPrimary: boolean
): string {
  const priority = isPrimary ? 'pri' : 'sec';
  return `${keyUnitId}.${layerId}.${priority}`;
}

export function extractAssignSlotAddress(
  addr: string
):
  | {
      keyUnitId: string;
      layerId: string;
      isPrimary: boolean;
    }
  | undefined {
  const arr = addr.split('.');
  if (arr.length !== 3) {
    return undefined;
  }
  const [keyUnitId, layerId, priority] = arr;
  return {
    keyUnitId,
    layerId,
    isPrimary: priority === 'pri'
  };
}

export function createNewEntityId(
  prefix: string,
  existingIds: string[]
): string {
  const numbers = existingIds
    .map(id => parseInt(id.replace(prefix, ''), 10))
    .filter(val => isFinite(val));
  if (numbers.length === 0) {
    return `${prefix}1`;
  }
  const newNumber = Math.max(...numbers) + 1;
  return `${prefix}${newNumber}`;
}

export function isAssignKeyBlank(assign?: IKeyAssignEntry): boolean {
  return (
    assign === undefined ||
    (assign.type === 'keyInput' && assign.virtualKey === 'K_NONE')
  );
}

export function isAssignKeySpecific(
  assign: IKeyAssignEntry | undefined,
  vk: VirtualKey
): boolean {
  return (
    (assign && assign.type === 'keyInput' && assign.virtualKey === vk) || false
  );
}

export function isAssignLayerTrigger(
  assign: IKeyAssignEntry | undefined,
  layerId: string
): boolean {
  return (
    (assign &&
      assign.type === 'holdLayer' &&
      assign.targetLayerId === layerId) ||
    false
  );
}

export function isAssignModifierActive(
  assign: IKeyAssignEntry | undefined,
  mo: ModifierVirtualKey
): boolean {
  return (
    (assign && assign.type === 'keyInput' && assign.modifiers?.includes(mo)) ||
    false
  );
}

export function isAssignHoldModifierActive(
  assign: IKeyAssignEntry | undefined,
  mo: ModifierVirtualKey
): boolean {
  return (
    (assign && assign.type === 'holdModifier' && assign.modifierKey === mo) ||
    false
  );
}

export function isCustomLayer(layer: ILayer | undefined): layer is ILayer {
  return (layer && layer.layerRole === 'custom') || false;
}

export const canShiftLayerOrder = (
  currentLayer: ILayer | undefined,
  layers: ILayer[],
  dir: -1 | 1
): boolean => {
  if (isCustomLayer(currentLayer)) {
    const index = layers.indexOf(currentLayer);
    const nextIndex = index + dir;
    return 2 <= nextIndex && nextIndex < layers.length;
  } else {
    return false;
  }
};

export function getEditModelLayerById(model: IEditModel, layerId: string) {
  return model.layers.find(la => la.layerId === layerId);
}

export function checkIfLognNameKeyAssign(text: string) {
  return text.length >= 2 && !text.match(/^F[0-9]+$/);
}

export function getAssignCategoryFromAssign(
  assign: IKeyAssignEntry | undefined
): AssignCategory {
  if (assign) {
    if (assign.type === 'keyInput') {
      return 'input';
    } else if (assign.type === 'holdLayer') {
      return 'hold';
    } else if (assign.type === 'holdModifier') {
      return 'hold';
    }
  }
  return 'none';
}
