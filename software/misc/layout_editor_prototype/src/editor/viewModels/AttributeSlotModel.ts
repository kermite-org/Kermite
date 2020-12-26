import { IEditPropKey, IKeyEntity } from '~/editor/models/DataSchema';
import { editMutations } from '~/editor/models/store';

export interface IAttributeSlotSource<K extends IEditPropKey> {
  propKey: K;
  label: string;
  getUnit(): string;
  validator(text: string): string | undefined;
  reader(value: IKeyEntity[K]): string;
  writer(text: string): IKeyEntity[K];
}

export class AttributeSlotModel<K extends IEditPropKey = IEditPropKey> {
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
