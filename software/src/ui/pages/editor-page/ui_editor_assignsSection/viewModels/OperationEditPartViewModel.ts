import {
  ModifierVirtualKey,
  VirtualKeyTexts,
  systemActionToLabelTextMap,
  systemActionAssignSelectionSource,
  encodeSingleModifierVirtualKey,
  VirtualKey,
} from '~/shared';
import { IOperationCardViewModel, texts } from '~/ui/common';
import { editorModel } from '~/ui/pages/editor-page/models/EditorModel';
import {
  virtualKeyGroupsTable2,
  virtualKeyGroupsTable3,
} from './virtualkeyGroupsTable';

const modifierVirtualKeys: ModifierVirtualKey[] = [
  'K_Shift',
  'K_Ctrl',
  'K_Alt',
  'K_Gui',
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
  systemActionEntries: IOperationCardViewModel[];
  virtualKeyEntryGroups2: IOperationCardViewModel[][];
}

function makeVeritualKeyEntryGroup(
  group: VirtualKey[],
): IOperationCardViewModel[] {
  const { editOperation, writeEditOperation } = editorModel;
  return group.map((vk) => ({
    sig: vk,
    text: VirtualKeyTexts[vk] || '',
    isCurrent:
      editOperation?.type === 'keyInput' && editOperation.virtualKey === vk,
    setCurrent: () =>
      writeEditOperation({
        type: 'keyInput',
        virtualKey: vk,
        attachedModifiers: 0,
      }),
    // isEnabled:
    //   !isDualSecondary ||
    //   (isDualSecondary &&
    //     modifierVirtualKeys.includes(vk as ModifierVirtualKey)),
    isEnabled: true,
    hint: texts.hint_assigner_assigns_keyInput,
  }));
}

export function makeOperationEditPartViewModel(): IOperationEditPartViewModel {
  const { editOperation, writeEditOperation } = editorModel;

  const isDualSecondary =
    RestrictDualSecondaryAssigns &&
    editorModel.isDualMode &&
    editorModel.dualModeEditTargetOperationSig === 'sec';

  const virtualKeyEntryGroups: IOperationCardViewModel[][] = virtualKeyGroupsTable2.map(
    makeVeritualKeyEntryGroup,
  );

  const virtualKeyEntryGroups2: IOperationCardViewModel[][] = virtualKeyGroupsTable3.map(
    makeVeritualKeyEntryGroup,
  );

  const attachedModifierEntries: IOperationCardViewModel[] = modifierVirtualKeys.map(
    (vk) => {
      const bitFlag = encodeSingleModifierVirtualKey(vk);
      const isCurrent =
        editOperation?.type === 'keyInput' &&
        (editOperation.attachedModifiers & bitFlag) > 0;

      const setCurrent = () => {
        if (editOperation?.type === 'keyInput') {
          const currMods = editOperation.attachedModifiers;
          const nextMods = !isCurrent
            ? currMods | bitFlag
            : currMods & ~bitFlag;
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

  const systemActionEntries: IOperationCardViewModel[] = systemActionAssignSelectionSource.map(
    (sa) => ({
      sig: sa,
      text: systemActionToLabelTextMap[sa],
      isCurrent:
        editOperation?.type === 'systemAction' && editOperation.action === sa,
      setCurrent: () =>
        writeEditOperation({
          type: 'systemAction',
          action: sa,
          payloadValue: 0,
        }),
      isEnabled: true,
      hint: '',
    }),
  );

  return {
    virtualKeyEntryGroups,
    attachedModifierEntries,
    layerCallEntries,
    systemActionEntries,
    virtualKeyEntryGroups2,
  };
}
