import { IKeyEntity, IEditPropKey } from '~/editor/DataSchema';
import { editMutations, editReader } from '~/editor/store';

interface IAttributeSlotSource<K extends IEditPropKey> {
  propKey: K;
  label: string;
  validator(text: string): string | undefined;
  reader(value: IKeyEntity[K]): string;
  writer(text: string): IKeyEntity[K];
}

const slotSources: IAttributeSlotSource<IEditPropKey>[] = [
  {
    propKey: 'keyId',
    label: 'KEY ID',
    validator: (text: string) =>
      text.length < 6 ? undefined : 'must be within 6 characters',
    reader: (value: string) => value,
    writer: (text: string) => text,
  },
  {
    propKey: 'x',
    label: 'X',
    validator: (text: string) =>
      text.match(/^-?[0-9.]+$/) ? undefined : 'must be a number',
    reader: (value: number) => value.toString(),
    writer: (text: string) => parseFloat(text),
  },
  {
    propKey: 'y',
    label: 'Y',
    validator: (text: string) =>
      text.match(/^-?[0-9.]+$/) ? undefined : 'must be a number',
    reader: (value: number) => value.toString(),
    writer: (text: string) => parseFloat(text),
  },
];

class AttributeSlotModel<K extends IEditPropKey = IEditPropKey> {
  private targetObject: IKeyEntity | undefined = undefined;

  private _originalValue: IKeyEntity[K] | undefined;
  private _editText: string = '';
  private _errorText: string = '';

  get propKey() {
    return this.source.propKey;
  }

  get label() {
    return this.source.label;
  }

  get editText() {
    return this._editText;
  }

  get errorText() {
    return this._errorText;
  }

  get canEdit() {
    return this.targetObject !== undefined;
  }

  get hasError() {
    return !!this._errorText;
  }

  constructor(
    private source: IAttributeSlotSource<K>,
    private slotFocusedCallback: (slot: AttributeSlotModel) => void
  ) {}

  private pullModelValue() {
    if (this.targetObject) {
      this._originalValue = this.targetObject[this.propKey];
      this._editText = this.source.reader(this._originalValue);
      this._errorText = '';
    } else {
      this._originalValue = undefined;
      this._editText = '';
      this._errorText = '';
    }
  }

  private pushEditTextToModelValue() {
    if (this.targetObject) {
      this._errorText = this.source.validator(this._editText) || '';
      if (!this._errorText) {
        const newValue = this.source.writer(this._editText);
        editMutations.changeKeyProperty(this.propKey, newValue);
        this._originalValue = newValue;
        this._errorText = '';
      }
    }
  }

  updateSource(keyEntity: IKeyEntity | undefined) {
    const sourceChanged =
      this.targetObject !== keyEntity ||
      this._originalValue !== keyEntity?.[this.propKey];
    this.targetObject = keyEntity;
    if (sourceChanged) {
      this.pullModelValue();
    }
  }

  setEditText = (text: string) => {
    this._editText = text;
    this.pushEditTextToModelValue();
  };

  resetError = () => {
    this.pullModelValue();
  };

  onFocus = () => {
    this.slotFocusedCallback(this);
    editMutations.startEdit();
  };

  onBlur = () => {
    editMutations.endEdit();
  };
}

class KeyEntityAttrsEditorModel {
  private _allSlots: AttributeSlotModel[];
  private _currentSlot: AttributeSlotModel | undefined;

  get allSlots() {
    return this._allSlots;
  }

  get errorText() {
    return this._currentSlot?.errorText
      ? `${this._currentSlot.label} ${this._currentSlot.errorText}`
      : '';
  }

  constructor() {
    this._allSlots = slotSources.map(
      (ss) => new AttributeSlotModel(ss, this.onSlotFocused)
    );
  }

  onSlotFocused = (targetSlot: AttributeSlotModel): void => {
    this._currentSlot = targetSlot;
    this._allSlots
      .filter((slot) => slot !== targetSlot)
      .forEach((slot) => slot.resetError());
  };

  update() {
    const ke = editReader.getCurrentKeyEntity();
    this._allSlots.forEach((slot) => slot.updateSource(ke));
  }
}

// M
// ----
// VM

interface IAttributeSlotViewModel {
  propKey: string;
  label: string;
  editText: string;
  setEditText(text: string): void;
  hasError: boolean;
  onFocus(): void;
  onBlur(): void;
  resetError(): void;
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
