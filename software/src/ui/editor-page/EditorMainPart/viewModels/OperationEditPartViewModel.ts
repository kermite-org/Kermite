import {
  ModifierVirtualKey,
  VirtualKeyTexts,
  addOptionToOptionsArray,
  removeOptionFromOptionsArray,
} from '~/shared';
import { texts } from '~/ui/common';
import { editorModel } from '~/ui/editor-page/EditorMainPart/models/EditorModel';
import { virtualKeyGroupsTable2 } from './virtualkeyGroupsTable';

export interface IOperationCardViewModel {
  sig: string;
  text: string;
  isCurrent: boolean;
  setCurrent(): void;
  isEnabled: boolean;
  hint: string;
}

const modifierVirtualKeys: ModifierVirtualKey[] = [
  'K_Shift',
  'K_Ctrl',
  'K_Alt',
  'K_OS',
];

const RestrictDualSecondaryAssigns = false;

export interface IPlainOperationEditCardsViewModel {
  noAssignEntry: IOperationCardViewModel;
  transparentEntry: IOperationCardViewModel;
  blockEntry: IOperationCardViewModel;
}

export function makePlainOperationEditCardsViewModel(): IPlainOperationEditCardsViewModel {
  const {
    assignEntry,
    writeAssignEntry,
    editOperation,
    writeEditOperation,
    isSlotSelected,
  } = editorModel;

  const noAssignEntry: IOperationCardViewModel = {
    sig: 'none',
    text: 'none',
    isCurrent:
      isSlotSelected &&
      assignEntry?.type !== 'block' &&
      assignEntry?.type !== 'transparent' &&
      editOperation === undefined,
    setCurrent: () => writeEditOperation(undefined),
    isEnabled: true,
    hint: texts.hint_assigner_assigns_none,
  };

  const transparentEntry: IOperationCardViewModel = {
    sig: 'transparent',
    text: 'trans',
    isCurrent: isSlotSelected && assignEntry?.type === 'transparent',
    setCurrent: () => writeAssignEntry({ type: 'transparent' }),
    isEnabled: true,
    hint: texts.hint_assigner_assigns_transparent,
  };

  const blockEntry: IOperationCardViewModel = {
    sig: 'block',
    text: 'block',
    isCurrent: isSlotSelected && assignEntry?.type === 'block',
    setCurrent: () => writeAssignEntry({ type: 'block' }),
    isEnabled: true,
    hint: texts.hint_assigner_assigns_block,
  };

  return {
    noAssignEntry,
    transparentEntry,
    blockEntry,
  };
}

export interface IOperationEditPartViewModel {
  virtualKeyEntryGroups: IOperationCardViewModel[][];
  attachedModifierEntries: IOperationCardViewModel[];
  layerCallEntries: IOperationCardViewModel[];
}

export function makeOperationEditPartViewModel(): IOperationEditPartViewModel {
  const { editOperation, writeEditOperation } = editorModel;

  const isDualSecondary =
    RestrictDualSecondaryAssigns &&
    editorModel.isDualMode &&
    editorModel.dualModeEditTargetOperationSig === 'sec';

  const virtualKeyEntryGroups: IOperationCardViewModel[][] = virtualKeyGroupsTable2.map(
    (group) =>
      group.map((vk) => ({
        sig: vk,
        text: VirtualKeyTexts[vk] || '',
        isCurrent:
          editOperation?.type === 'keyInput' && editOperation.virtualKey === vk,
        setCurrent: () =>
          writeEditOperation({ type: 'keyInput', virtualKey: vk }),
        isEnabled:
          !isDualSecondary ||
          (isDualSecondary &&
            modifierVirtualKeys.includes(vk as ModifierVirtualKey)),
        hint: texts.hint_assigner_assigns_keyInput,
      })),
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
        isEnabled: editOperation?.type === 'keyInput' && !isDualSecondary,
        hint: texts.hint_assigner_assigns_modifiers,
      };
    },
  );

  const layerCallEntries: IOperationCardViewModel[] = editorModel.profileData.layers
    // .filter((la) => la.layerId !== 'la0')
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
          invocationMode: 'hold',
        }),
      isEnabled: true,
      hint: texts.hint_assigner_assigns_layers,
    }));

  const layerCallEntryClearExclusive: IOperationCardViewModel = {
    sig: 'ClearExclusive',
    text: 'ex-clear',
    isCurrent: editOperation?.type === 'layerClearExclusive',
    setCurrent: () =>
      writeEditOperation({
        type: 'layerClearExclusive',
        targetExclusionGroup: 1,
      }),
    isEnabled: true,
    hint: texts.hint_assigner_assigns_clearExclusiveGroup,
  };

  layerCallEntries.push(layerCallEntryClearExclusive);

  return {
    virtualKeyEntryGroups,
    attachedModifierEntries,
    layerCallEntries,
  };
}
