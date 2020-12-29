export interface IConfigTextEditModel {
  editText: string;
  valid: boolean;
  disabled: boolean;
  onValueChanged(text: string): void;
  onFocus(): void;
  onBlur(): void;
  update(sourceText: string): void;
}

export class ConfigTextEditModel implements IConfigTextEditModel {
  originalValue: string | undefined;
  editText: string = '';
  valid: boolean = true;

  constructor(
    private patterns: RegExp[],
    private textOutputFunc: (text: string) => void
  ) {}

  get disabled() {
    return this.originalValue === undefined;
  }

  onValueChanged = (text: string) => {
    this.editText = text;
    this.valid = this.patterns.some((p) => text.match(p));
  };

  onFocus = () => {};

  onBlur = () => {
    if (this.valid) {
      this.textOutputFunc(this.editText);
    } else {
      this.editText = this.originalValue || '';
      this.valid = true;
    }
  };

  update(modelValue: string | undefined) {
    if (this.originalValue !== modelValue) {
      this.originalValue = modelValue;
      this.editText = this.originalValue || '';
      this.valid = true;
    }
  }
}

export class ConfigTextEditModelDynamic implements IConfigTextEditModel {
  originalValue: string | undefined;
  editText: string = '';
  valid: boolean = true;

  constructor(
    private patterns: RegExp[],
    private procStartEdit: () => void,
    private procEmitValidText: (text: string) => void,
    private procEndEdit: () => void
  ) {}

  get disabled() {
    return this.originalValue === undefined;
  }

  onValueChanged = (text: string) => {
    this.editText = text;
    this.valid = this.patterns.some((p) => text.match(p));
    if (this.valid) {
      this.procEmitValidText(this.editText);
    }
  };

  onFocus = () => {
    this.procStartEdit();
  };

  onBlur = () => {
    this.procEndEdit();
    if (!this.valid) {
      this.editText = this.originalValue || '';
      this.valid = true;
    }
  };

  update(modelValue: string | undefined) {
    if (this.originalValue !== modelValue) {
      this.originalValue = modelValue;
      this.editText = this.originalValue || '';
      this.valid = true;
    }
  }
}
