export interface IAttributeSlotSource<T, K extends keyof T> {
  propKey: K;
  label: string;
  getUnit(): string;
  validator(text: string): string | undefined;
  reader(value: T[K]): string;
  writer(text: string): T[K];
}

export interface IAttributeSlotViewModel {
  editText: string;
  valid: boolean;
  disabled: boolean;
  onValueChanged(text: string): void;
  onFocus(): void;
  onBlur(): void;
  label: string;
  unit: string;
}
export class AttributeSlotModel<T, K extends keyof T = keyof T> {
  private _originalValue: T[K] | undefined;
  private _editText: string = '';
  private _errorText: string = '';
  private _hasFocus: boolean = false;

  get propKey() {
    return this.source.propKey;
  }

  get label() {
    return this.source.label;
  }

  get unit() {
    return this.source.getUnit();
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

  constructor(
    private source: IAttributeSlotSource<T, K>,
    private procStartEdit: () => void,
    private procChangeEditValue: (propKey: K, value: T[K]) => void,
    private procEndEdit: () => void,
  ) {}

  private pullModelValue(targetObject: T | undefined) {
    this._originalValue = targetObject?.[this.propKey];
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
      this.procChangeEditValue(this.propKey, newValue);
      this._originalValue = newValue;
      this._errorText = '';
    }
  }

  updateSource(targetObject: T | undefined) {
    if (this._hasFocus) {
      return;
    }
    if (this._originalValue !== targetObject?.[this.propKey]) {
      this.pullModelValue(targetObject);
      this.resetEditText();
    }
  }

  setEditText = (text: string) => {
    this._editText = text;
    this.pushEditTextToModelValue();
  };

  onFocus = () => {
    this.procStartEdit();
    this._hasFocus = true;
  };

  onBlur = () => {
    this.procEndEdit();
    this.resetEditText();
    this._hasFocus = false;
  };

  emitViewModel(): IAttributeSlotViewModel {
    return {
      editText: this.editText,
      valid: !this.hasError,
      disabled: !this.canEdit,
      onValueChanged: this.setEditText,
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      label: this.label,
      unit: this.unit,
    };
  }
}
