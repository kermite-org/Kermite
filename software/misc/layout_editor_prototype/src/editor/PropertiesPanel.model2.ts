import { IKeyEntity, IEditPropKey } from '~/editor/DataSchema';
import { appState, editMutations, editReader } from '~/editor/store';

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
  private _originalValue: IKeyEntity[K] | undefined;
  private _editText: string = '';
  private _errorText: string = '';
  private _hasFocus: boolean = false;

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
    return this._originalValue !== undefined;
  }

  get hasError() {
    return !!this._errorText;
  }

  get hasFocus() {
    return this._hasFocus;
  }

  constructor(private source: IAttributeSlotSource<K>) {}

  private pullModelValue(targetKeyEntity: IKeyEntity | undefined) {
    this._originalValue = targetKeyEntity?.[this.propKey];
  }

  private resetEditText() {
    this._editText =
      (this._originalValue !== undefined &&
        this.source.reader(this._originalValue)) ||
      '';
    this._errorText = '';
  }

  private pushEditTextToModelValue() {
    this._errorText = this.source.validator(this._editText) || '';
    if (!this._errorText) {
      const newValue = this.source.writer(this._editText);
      editMutations.changeKeyProperty(this.propKey, newValue);
      this._originalValue = newValue;
      this._errorText = '';
    }
  }

  updateSource(targetKeyEntity: IKeyEntity | undefined) {
    if (this._originalValue !== targetKeyEntity?.[this.propKey]) {
      this.pullModelValue(targetKeyEntity);
      this.resetEditText();
    }
  }

  setEditText = (text: string) => {
    this._editText = text;
    this.pushEditTextToModelValue();
  };

  onFocus = () => {
    editMutations.startEdit();
    this._hasFocus = true;
  };

  onBlur = () => {
    editMutations.endEdit();
    this.resetEditText();
    this._hasFocus = false;
  };
}

class KeyEntityAttrsEditorModel {
  private _allSlots: AttributeSlotModel[] = slotSources.map(
    (ss) => new AttributeSlotModel(ss)
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
    const targetKeyEntity =
      appState.editor.ghost || editReader.currentKeyEntity;
    this._allSlots.forEach((slot) => slot.updateSource(targetKeyEntity));
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
