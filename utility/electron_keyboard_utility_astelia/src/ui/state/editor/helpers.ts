import { IKeyAssignEntry, ILayer, IEditModel } from '~contract/data';
import { VirtualKey, ModifierVirtualKeys } from '~model/HighLevelDefs';

export function getAssignSlotAddress(
  keyUnitId: string,
  layerId: string,
  isPrimary: boolean
): string {
  const priority = isPrimary ? 'pri' : 'sec';
  return `${keyUnitId}.${layerId}.${priority}`;
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

export function isAssignModifierActive(
  assign: IKeyAssignEntry | undefined,
  mo: ModifierVirtualKeys
): boolean {
  return (
    (assign && assign.type === 'keyInput' && assign.modifiers?.includes(mo)) ||
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
