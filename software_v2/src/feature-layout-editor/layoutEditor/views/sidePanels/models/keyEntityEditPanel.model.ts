import { useLocal } from 'alumina';
import { ICommonSelectorViewModel } from '~/app-shared';
import { useClosureModel } from '../../../common';
import {
  IEditKeyEntity,
  IEditPropKey,
  editMutations,
  editReader,
  getKeyIdentifierText,
} from '../../../models';
import {
  AttributeSlotModel,
  IAttributeSlotSource,
  IAttributeSlotViewModel,
  IConfigTextEditModel2,
  createConfigTextEditModelDynamic2,
  makeSelectorModel,
} from './slots';

function floatNumberValidator(text: string) {
  if (text.length > 10) {
    return 'too many digits';
  }
  return text.match(/^-?\d+\.?\d*?$/) ? undefined : 'must be a number';
}

const slotSources: IAttributeSlotSource<IEditKeyEntity, IEditPropKey>[] = [
  // {
  //   propKey: 'editKeyId',
  //   label: 'editKeyId',
  //   getUnit: () => '',
  //   validator: (text: string) =>
  //     text.length < 6 ? undefined : 'must be within 6 characters',
  //   reader: (value: string) => value,
  //   writer: (text: string) => text,
  // },
  {
    propKey: 'x',
    label: 'x',
    getUnit: () => editReader.coordUnitSuffix,
    validator: floatNumberValidator,
    reader: (value: number) => value.toString(),
    writer: (text: string) => parseFloat(text),
  },
  {
    propKey: 'y',
    label: 'y',
    getUnit: () => editReader.coordUnitSuffix,
    validator: floatNumberValidator,
    reader: (value: number) => value.toString(),
    writer: (text: string) => parseFloat(text),
  },
  {
    propKey: 'angle',
    label: 'angle',
    getUnit: () => 'deg',
    validator: floatNumberValidator,
    reader: (value: number) => value.toString(),
    writer: (text: string) => parseFloat(text),
  },
  {
    propKey: 'shape',
    label: 'shape',
    getUnit: () => {
      const shape = editReader.currentKeyEntity?.shape;
      if (shape?.startsWith('std')) {
        return editReader.sizeUnit.mode === 'KP' ? 'U' : 'mm';
      }
      return '';
    },
    validator(text: string) {
      const patterns = [
        /^\d+\.?\d*$/,
        /^\d+\.?\d* \d+\.?\d*$/,
        // /^circle$/,
        /^isoEnter$/,
      ];
      const valid = patterns.some((p) => text.match(p));

      // if (text !== 'circle' && text !== 'isoEnter') {
      if (text !== 'isoEnter') {
        const textValues = text.split(' ');
        if (textValues.some((t) => t.length > 8)) {
          return 'too many digits';
        }
        const numberValues = textValues.map((v) => parseFloat(v));
        if (numberValues.some((val) => val > 16)) {
          return 'key size too large';
        }
      }

      return valid ? undefined : 'invalid specification';
    },
    reader(value: string) {
      if (value.startsWith('std') || value.startsWith('ext')) {
        return value.split(' ').slice(1).join(' ');
      }
      return '';
    },
    writer(text: string) {
      // if (text === 'circle' || text === 'isoEnter') {
      if (text === 'isoEnter') {
        return `ext ${text}`;
      }
      const values = text.split(' ');
      const floatValues = values.map((v) => parseFloat(v)).join(' ');
      return `std ${floatValues}`;
    },
  },
  // {
  //   propKey: 'keyIndex',
  //   label: 'keyIndex',
  //   getUnit: () => '',
  //   validator(text: string) {
  //     if (text === '') {
  //       return undefined;
  //     }
  //     return text.match(/^[0-9]+$/) ? undefined : 'must be an integer >= 0';
  //   },
  //   reader(value: number) {
  //     if (value === -1) {
  //       return '';
  //     }
  //     return value.toString();
  //   },
  //   writer(text: string) {
  //     if (text === '') {
  //       return -1;
  //     }
  //     return parseInt(text);
  //   },
  // },
];

class KeyEntityAttrsEditorModel {
  private _allSlots: AttributeSlotModel<IEditKeyEntity, IEditPropKey>[] =
    slotSources.map(
      (ss) =>
        new AttributeSlotModel(
          ss,
          editMutations.startKeyEdit,
          editMutations.changeKeyProperty,
          editMutations.endKeyEdit,
        ),
    );

  get allSlots() {
    return this._allSlots;
  }

  get errorText() {
    const currentSlot = this._allSlots.find((slot) => slot.hasFocus);
    return currentSlot?.errorText
      ? `${currentSlot.label} ${currentSlot.errorText}`
      : '';
  }

  get keyIdentificationText() {
    const {
      currentKeyEntity: ke,
      isCurrentKeyMirror,
      isManualKeyIdMode,
    } = editReader;
    if (ke) {
      let text = getKeyIdentifierText(
        ke,
        isCurrentKeyMirror,
        isManualKeyIdMode,
      );
      if (isCurrentKeyMirror) {
        text += ' (mirror)';
      }
      return text;
    }
    return '';
  }

  update() {
    const targetKeyEntity = editReader.currentKeyEntity;
    this._allSlots.forEach((slot) => slot.updateSource(targetKeyEntity));
  }
}

// M
// ----
// VM
interface IPropertyPanelModel {
  keyEntityAttrsVm: {
    keyIdentificationText: string;
    showManualEditKeyId: boolean;
    slots: IAttributeSlotViewModel[];
    vmKeyId: IConfigTextEditModel2;
    vmKeyIndex: IConfigTextEditModel2;
    errorText: string;
    vmGroupId: ICommonSelectorViewModel;
  };
}

function makeGroupIdSelectorModel() {
  const { currentKeyEntity, allTransGroups } = editReader;
  return makeSelectorModel<string>({
    sources: currentKeyEntity
      ? [
          ['', '--'],
          ...allTransGroups.map(
            (group) => [group.id, group.id] as [string, string],
          ),
        ]
      : [],
    reader: () => currentKeyEntity?.groupId,
    writer: (newValue: string) => {
      if (currentKeyEntity) {
        editMutations.changeKeyProperty('groupId', newValue);
        editMutations.setCurrentTransGroupById(newValue);
      }
    },
  });
}

function createKeyIdEditViewModel() {
  return createConfigTextEditModelDynamic2({
    procStartEdit: editMutations.startEdit,
    procEmitValidText: (text) => {
      const { isCurrentKeyMirror } = editReader;
      const targetPropKey: keyof IEditKeyEntity = isCurrentKeyMirror
        ? 'mirrorEditKeyId'
        : 'editKeyId';
      editMutations.changeKeyProperty(targetPropKey, text);
    },
    procEndEdit: editMutations.endEdit,
    checker: (text: string) => {
      if (text === '') {
        return undefined;
      }
      if (text.length > 8) {
        return 'keyId must be within 8 characters';
      }

      const newEditKeyId = text;

      const { allKeyEntities, currentKeyEntity, isCurrentKeyMirror } =
        editReader;

      const peer = isCurrentKeyMirror
        ? currentKeyEntity?.editKeyId
        : currentKeyEntity?.mirrorEditKeyId;

      const duplicate =
        newEditKeyId === peer ||
        allKeyEntities.some(
          (ke) =>
            ke !== currentKeyEntity &&
            (ke.editKeyId === newEditKeyId ||
              ke.mirrorEditKeyId === newEditKeyId),
        );

      if (duplicate) {
        return 'keyId duplication';
      }
      return undefined;
    },
    sourceTextFeeder: () => {
      const { currentKeyEntity: ke, isCurrentKeyMirror } = editReader;
      if (ke) {
        return isCurrentKeyMirror ? ke.mirrorEditKeyId : ke.editKeyId;
      } else {
        return undefined;
      }
    },
  });
}

function createKeyIndexEditViewModel() {
  return createConfigTextEditModelDynamic2({
    procStartEdit: editMutations.startEdit,
    procEmitValidText: (text) => {
      const value = text === '' ? -1 : parseInt(text);
      const { isCurrentKeyMirror } = editReader;
      const targetPropKey: keyof IEditKeyEntity = isCurrentKeyMirror
        ? 'mirrorKeyIndex'
        : 'keyIndex';
      editMutations.changeKeyProperty(targetPropKey, value);
    },
    procEndEdit: editMutations.endEdit,
    checker: (text: string) => {
      if (text === '') {
        return undefined;
      }
      if (!text.match(/^[0-9]+$/)) {
        return 'keyIndex must be a number';
      }
      const newKeyIndex = parseInt(text);

      if (newKeyIndex > 9999) {
        return 'keyIndex too large';
      }

      const { allKeyEntities, currentKeyEntity, isCurrentKeyMirror } =
        editReader;

      const peer = isCurrentKeyMirror
        ? currentKeyEntity?.keyIndex
        : currentKeyEntity?.mirrorKeyIndex;

      const duplicate =
        newKeyIndex === peer ||
        allKeyEntities.some(
          (ke) =>
            ke !== currentKeyEntity &&
            (ke.keyIndex === newKeyIndex || ke.mirrorKeyIndex === newKeyIndex),
        );

      if (duplicate) {
        return 'keyIndex duplication';
      }
      return undefined;
    },
    sourceTextFeeder: () => {
      const { currentKeyEntity: ke, isCurrentKeyMirror } = editReader;
      if (ke) {
        const keyIndex = isCurrentKeyMirror ? ke.mirrorKeyIndex : ke.keyIndex;
        return keyIndex !== -1 ? keyIndex.toString() : '';
      } else {
        return undefined;
      }
    },
  });
}

export function useKeyEntityEditPanelModel(): IPropertyPanelModel {
  const model = useLocal(() => new KeyEntityAttrsEditorModel());
  model.update();

  const vmKeyId = useClosureModel(createKeyIdEditViewModel);
  const vmKeyIndex = useClosureModel(createKeyIndexEditViewModel);

  return {
    keyEntityAttrsVm: {
      slots: model.allSlots.map((slot) => slot.emitViewModel()),
      errorText: model.errorText,
      vmGroupId: makeGroupIdSelectorModel(),
      keyIdentificationText: model.keyIdentificationText,
      showManualEditKeyId: editReader.isManualKeyIdMode,
      vmKeyId,
      vmKeyIndex,
    },
  };
}
