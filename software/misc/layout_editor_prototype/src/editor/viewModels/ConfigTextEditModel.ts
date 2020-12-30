export interface IConfigTextEditModel {
  editText: string;
  valid: boolean;
  disabled: boolean;
  onValueChanged(text: string): void;
  onFocus(): void;
  onBlur(): void;
  update(sourceText: string | undefined): void;
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
      this.originalValue = this.editText;
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

/*
closure version
export function createConfigTextEditModelDynamic(
  patterns: RegExp[],
  procStartEdit: () => void,
  procEmitValidText: (text: string) => void,
  procEndEdit: () => void
): IConfigTextEditModel {
  let originalText: string | undefined;
  let editText: string = '';
  let valid: boolean = true;
  return {
    get editText() {
      return editText;
    },
    get valid() {
      return valid;
    },
    get disabled() {
      return originalText === undefined;
    },
    onValueChanged(text: string) {
      editText = text;
      valid = patterns.some((p) => text.match(p));
      if (valid) {
        originalText = editText;
        procEmitValidText(editText);
      }
    },
    onFocus() {
      procStartEdit();
    },
    onBlur() {
      procEndEdit();
      if (!valid) {
        editText = originalText || '';
        valid = true;
      }
    },
    update(sourceText: string | undefined) {
      if (originalText !== sourceText) {
        originalText = sourceText;
        editText = originalText || '';
        valid = true;
      }
    },
  };
}
*/
