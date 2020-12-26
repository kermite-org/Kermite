import {
  editMutations,
  editReader,
  IEditPropKey,
  IKeyEntity,
} from '~/editor/models';
import {
  AttributeSlotModel,
  IAttributeSlotSource,
} from '~/editor/viewModels/AttributeSlotModel';

const slotSources: IAttributeSlotSource<IKeyEntity, IEditPropKey>[] = [
  {
    propKey: 'keyId',
    label: 'keyID',
    getUnit: () => '',
    validator: (text: string) =>
      text.length < 6 ? undefined : 'must be within 6 characters',
    reader: (value: string) => value,
    writer: (text: string) => text,
  },
  {
    propKey: 'x',
    label: 'x',
    getUnit: () => 'mm',
    validator: (text: string) =>
      text.match(/^-?[0-9.]+$/) ? undefined : 'must be a number',
    reader: (value: number) => value.toString(),
    writer: (text: string) => parseFloat(text),
  },
  {
    propKey: 'y',
    label: 'y',
    getUnit: () => 'mm',
    validator: (text: string) =>
      text.match(/^-?[0-9.]+$/) ? undefined : 'must be a number',
    reader: (value: number) => value.toString(),
    writer: (text: string) => parseFloat(text),
  },
  {
    propKey: 'r',
    label: 'angle',
    getUnit: () => 'deg',
    validator: (text: string) =>
      text.match(/^-?[0-9.]+$/) ? undefined : 'must be a number',
    reader: (value: number) => value.toString(),
    writer: (text: string) => parseFloat(text),
  },
  {
    propKey: 'shape',
    label: 'shape std',
    getUnit: () => 'U',
    validator(text: string) {
      if (text === '0') {
        return 'must be a number > 0';
      }
      return text.match(/^[0-9.]+$/) ? undefined : 'must be a number';
    },
    reader(value: string) {
      if (value.startsWith('std')) {
        return value.split(' ')[1];
      }
      return '';
    },
    writer(text: string) {
      return 'std ' + parseFloat(text);
    },
  },
  {
    propKey: 'shape',
    label: 'shape ref',
    getUnit: () => '',
    validator(text: string) {
      if (text.length === 0) {
        return 'must be a text';
      }
    },
    reader(value: string) {
      if (value.startsWith('ref')) {
        return value.split(' ')[1];
      }
      return '';
    },
    writer(text: string) {
      return 'ref ' + text;
    },
  },
  {
    propKey: 'keyIndex',
    label: 'keyIndex',
    getUnit: () => '',
    validator(text: string) {
      if (text === '') {
        return undefined;
      }
      return text.match(/^[0-9]+$/) ? undefined : 'must be an integer >= 0';
    },
    reader(value: number) {
      if (value === -1) {
        return '';
      }
      return value.toString();
    },
    writer(text: string) {
      if (text === '') {
        return -1;
      }
      return parseInt(text);
    },
  },
];

class KeyEntityAttrsEditorModel {
  private _allSlots: AttributeSlotModel<
    IKeyEntity,
    IEditPropKey
  >[] = slotSources.map(
    (ss) =>
      new AttributeSlotModel(
        ss,
        editMutations.startEdit,
        editMutations.changeKeyProperty,
        editMutations.endEdit
      )
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

  update() {
    const targetKeyEntity = editReader.currentKeyEntity;
    this._allSlots.forEach((slot) => slot.updateSource(targetKeyEntity));
  }
}

// M
// ----
// VM

interface IAttributeSlotViewModel {
  propKey: string;
  label: string;
  unit: string;
  editText: string;
  setEditText(text: string): void;
  hasError: boolean;
  onFocus(): void;
  onBlur(): void;
  canEdit: boolean;
}
interface IPropertyPanelModel {
  keyEntityAttrsVm: {
    slots: IAttributeSlotViewModel[];
    errorText: string;
  };
}

const keyEntityAttrsModel = new KeyEntityAttrsEditorModel();

export function usePropertyPanelModel(): IPropertyPanelModel {
  const model = keyEntityAttrsModel;
  model.update();
  return {
    keyEntityAttrsVm: {
      slots: model.allSlots,
      errorText: model.errorText,
    },
  };
}
