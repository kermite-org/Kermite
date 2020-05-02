import { virtualKeyGroupsTable } from './virtualkeyGroupsTable';
import { VirtualKeyTexts } from '~defs/VirtualKeyTexts';
import { editorModel } from '~ui2/models/zAppDomain';
import { ModifierVirtualKey } from '~defs/VirtualKeys';
import {
  addOptionToOptionsArray,
  removeOptionFromOptionsArray
} from '~funcs/Utils';

export interface IOperationCardViewModel {
  sig: string;
  text: string;
  isCurrent: boolean;
  setCurrent(): void;
  isEnabled: boolean;
}

interface IOperationEditPartViewModel {
  noAssignEntry: IOperationCardViewModel;
  virtualKeyEntryGroups: IOperationCardViewModel[][];
  attachedModifierEntries: IOperationCardViewModel[];
  layerCallEntries: IOperationCardViewModel[];
}

const modifierVirtualKeys: ModifierVirtualKey[] = [
  'K_Shift',
  'K_Ctrl',
  'K_Alt',
  'K_OS'
];

export function makeOperationEditPartViewModel(): IOperationEditPartViewModel {
  const { editOperation, writeEditOperation } = editorModel;

  const noAssignEntry: IOperationCardViewModel = {
    sig: 'none',
    text: 'none',
    isCurrent: editOperation === undefined,
    setCurrent: () => writeEditOperation(undefined),
    isEnabled: true
  };

  const virtualKeyEntryGroups: IOperationCardViewModel[][] = virtualKeyGroupsTable.map(
    (group) =>
      group.map((vk) => ({
        sig: vk,
        text: VirtualKeyTexts[vk] || '',
        isCurrent:
          editOperation?.type === 'keyInput' && editOperation.virtualKey === vk,
        setCurrent: () =>
          writeEditOperation({ type: 'keyInput', virtualKey: vk }),
        isEnabled: true
      }))
  );

  const attachedModifierEntries: IOperationCardViewModel[] = modifierVirtualKeys.map(
    (vk) => {
      const isCurrent =
        (editOperation?.type === 'keyInput' &&
          editOperation.attachedModifiers?.includes(vk)) ||
        false;

      const setCurrent = () => {
        if (editOperation?.type === 'keyInput') {
          const currMods = editOperation.attachedModifiers;
          const nextMods = !isCurrent
            ? addOptionToOptionsArray(currMods, vk)
            : removeOptionFromOptionsArray(currMods, vk);
          writeEditOperation({ ...editOperation, attachedModifiers: nextMods });
        }
      };
      return {
        sig: vk,
        text: VirtualKeyTexts[vk] || '',
        isCurrent,
        setCurrent,
        isEnabled: editOperation?.type === 'keyInput'
      };
    }
  );

  const layerCallEntries: IOperationCardViewModel[] = editorModel.profileData.layers
    .filter((la) => la.layerId !== 'la0')
    .map((la) => ({
      sig: la.layerId,
      text: la.layerName,
      isCurrent:
        editOperation?.type === 'layerCall' &&
        editOperation.targetLayerId === la.layerId,
      setCurrent: () =>
        writeEditOperation({
          type: 'layerCall',
          targetLayerId: la.layerId,
          invocationMode: 'hold'
        }),
      isEnabled: true
    }));
  return {
    noAssignEntry,
    virtualKeyEntryGroups,
    attachedModifierEntries,
    layerCallEntries
  };
}
