import { IKeyEntity } from '~/editor/DataSchema';
import { appState } from '~/editor/store';
import { Hook } from '~/qx';

function getKeyEntityById(id: string | undefined) {
  return appState.editor.design.keyEntities.find((ke) => ke.id === id);
}

interface IAttributeSlotSource<T> {
  propKey: keyof IKeyEntity;
  label: string;
  validator(text: string): string | undefined;
  reader(value: T): string;
  writer(text: string): T;
}

const slotSources: IAttributeSlotSource<any>[] = [
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

interface IAttributeSlotFocusListener {
  onSlotFocused(slot: AttributeSlotModel): void;
}
class AttributeSlotModel {
  private targetObject: { [key in string]: any } | undefined = undefined;

  private _originalValue: any;
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

  constructor(
    private source: IAttributeSlotSource<any>,
    private focusListener: IAttributeSlotFocusListener
  ) {}

  private pullModelValue() {
    if (this.targetObject) {
      this._originalValue = this.targetObject[this.propKey];
      this._editText = this.source.reader(this._originalValue);
      this._errorText = '';
    } else {
      this._editText = '';
      this._errorText = '';
    }
  }

  private pushEditTextToModelValue() {
    if (this.targetObject) {
      this._errorText = this.source.validator(this._editText) || '';
      if (!this._errorText) {
        const newValue = this.source.writer(this._editText);
        this.targetObject[this.propKey] = newValue;
        this._originalValue = newValue;
        this._errorText = '';
      }
    }
  }

  setKeyEntity(ke: IKeyEntity | undefined) {
    this.targetObject = ke;
    this.pullModelValue();
  }

  setEditText = (text: string) => {
    this._editText = text;
    this.pushEditTextToModelValue();
  };

  update() {
    if (this.targetObject) {
      const currentValue = this.targetObject[this.propKey];
      if (this._originalValue !== currentValue) {
        this.pullModelValue();
      }
    }
  }

  resetError = () => {
    this.pullModelValue();
  };

  onFocus = () => {
    this.focusListener.onSlotFocused(this);
  };

  onBlur = () => {
    this.pullModelValue();
  };
}

class KeyEntityAttrsEditorModel {
  allSlots: AttributeSlotModel[] = slotSources.map(
    (ss) => new AttributeSlotModel(ss, this)
  );

  private currentSlot: AttributeSlotModel | undefined;

  onSlotFocused = (targetSlot: AttributeSlotModel): void => {
    this.currentSlot = targetSlot;
  };

  update() {
    this.allSlots.forEach((slot) => slot.update());
  }

  setTargetKeyEntity(targetKeyEntity: IKeyEntity | undefined) {
    this.allSlots.forEach((slot) => slot.setKeyEntity(targetKeyEntity));
  }

  get errorText() {
    return this.currentSlot?.errorText
      ? `${this.currentSlot.label} ${this.currentSlot.errorText}`
      : '';
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

function createAttributeSlotViewModel(
  slot: AttributeSlotModel
): IAttributeSlotViewModel {
  const canEdit = appState.editor.currentkeyEntityId !== undefined;
  return {
    propKey: slot.propKey,
    label: slot.label,
    editText: slot.editText,
    setEditText: slot.setEditText,
    hasError: !!slot.errorText,
    onFocus: slot.onFocus,
    onBlur: slot.onBlur,
    resetError: slot.resetError,
    canEdit,
  };
}

interface IKeyEntityAttrsEditorViewModel {
  readonly slots: IAttributeSlotViewModel[];
  readonly errorText: string;
}

function createKeyEntityAttrsEditorViewModel(
  model: KeyEntityAttrsEditorModel
): IKeyEntityAttrsEditorViewModel {
  return {
    slots: model.allSlots.map(createAttributeSlotViewModel),
    errorText: model.errorText,
  };
}

const keyEntityAttrsModel = new KeyEntityAttrsEditorModel();

interface IPropertyPanelModel {
  readonly keyEntityAttrsVm: IKeyEntityAttrsEditorViewModel;
}

export function usePropertyPanelModel(): IPropertyPanelModel {
  const { editor } = appState;
  Hook.useEffect(() => {
    const ke = getKeyEntityById(editor.currentkeyEntityId);
    keyEntityAttrsModel.setTargetKeyEntity(ke);
  }, [editor.currentkeyEntityId]);

  keyEntityAttrsModel.update();

  return {
    keyEntityAttrsVm: createKeyEntityAttrsEditorViewModel(keyEntityAttrsModel),
  };
}
