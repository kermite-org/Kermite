import {
  consumerControlActionToLabelTextMap,
  consumerControlAssignSelectionSource,
  encodeSingleModifierVirtualKey,
  ModifierVirtualKey,
  systemActionAssignSelectionSource,
  systemActionToLabelTextMap,
  VirtualKey,
  VirtualKeyTexts,
} from '~/shared';
import { IOperationCardViewModel, texts } from '~/ui/base';
import { assignerModel } from '~/ui/featureEditors/profileEditor/models/assignerModel';
import {
  getKeyAssignNote,
  getSystemActionNote,
} from '~/ui/featureEditors/profileEditor/models/keyAssignNoteTexts';
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
  } = assignerModel;

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
    hint: texts.assignerAssignsPaletteHint.none,
  };

  const transparentEntry: IOperationCardViewModel = {
    sig: 'transparent',
    text: 'trans',
    isCurrent: isSlotSelected && assignEntry?.type === 'transparent',
    setCurrent: () => writeAssignEntry({ type: 'transparent' }),
    isEnabled: true,
    hint: texts.assignerAssignsPaletteHint.transparent,
  };

  const blockEntry: IOperationCardViewModel = {
    sig: 'block',
    text: 'block',
    isCurrent: isSlotSelected && assignEntry?.type === 'block',
    setCurrent: () => writeAssignEntry({ type: 'block' }),
    isEnabled: true,
    hint: texts.assignerAssignsPaletteHint.block,
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

function makeVirtualKeyEntryGroup(
  group: VirtualKey[],
): IOperationCardViewModel[] {
  const { editOperation, writeEditOperation } = assignerModel;
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
    hint: getKeyAssignNote(vk),
  }));
}

export function makeOperationEditPartViewModel(): IOperationEditPartViewModel {
  const { editOperation, writeEditOperation } = assignerModel;

  const isDualSecondary =
    RestrictDualSecondaryAssigns &&
    assignerModel.isDualMode &&
    assignerModel.dualModeEditTargetOperationSig === 'sec';

  const virtualKeyEntryGroups: IOperationCardViewModel[][] =
    virtualKeyGroupsTable2.map(makeVirtualKeyEntryGroup);

  const virtualKeyEntryGroups2: IOperationCardViewModel[][] =
    virtualKeyGroupsTable3.map(makeVirtualKeyEntryGroup);

  const attachedModifierEntries: IOperationCardViewModel[] =
    modifierVirtualKeys.map((vk) => {
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
        hint: texts.assignerAssignsPaletteHint.modifiers,
      };
    });

  const layerCallEntries: IOperationCardViewModel[] =
    assignerModel.profileData.layers
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
        hint: texts.assignerAssignsPaletteHint.layers,
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
    hint: texts.assignerAssignsPaletteHint.clearExclusiveGroup,
  };

  layerCallEntries.push(layerCallEntryClearExclusive);

  const systemActionEntries: IOperationCardViewModel[] =
    systemActionAssignSelectionSource.map((sa) => ({
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
      hint: getSystemActionNote(sa),
    }));

  const consumerControlEntries: IOperationCardViewModel[] =
    consumerControlAssignSelectionSource.map((cc) => ({
      sig: cc,
      text: consumerControlActionToLabelTextMap[cc],
      isCurrent:
        editOperation?.type === 'consumerControl' &&
        editOperation.action === cc,
      setCurrent: () =>
        writeEditOperation({
          type: 'consumerControl',
          action: cc,
        }),
      isEnabled: true,
      hint: 'Set consumer control assign.',
    }));
  virtualKeyEntryGroups2.push(consumerControlEntries);

  return {
    virtualKeyEntryGroups,
    attachedModifierEntries,
    layerCallEntries,
    systemActionEntries,
    virtualKeyEntryGroups2,
  };
}
