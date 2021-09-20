export interface IConfigTextEditModel {
  editText: string;
  valid: boolean;
  disabled: boolean;
  onValueChanged(text: string): void;
  onFocus(): void;
  onBlur(): void;
  update(sourceText: string | undefined): void;
}

// reflect edit value to model on blur
export function createConfigTextEditModel(
  checker: (text: string) => boolean,
  textOutputFunc: (text: string) => void,
): IConfigTextEditModel {
  let originalText: string | undefined;
  let editText = '';
  let valid = true;
  let hasFocus = false;
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
    onFocus() {
      hasFocus = true;
    },
    onValueChanged(text: string) {
      editText = text;
      valid = checker(text);
    },
    onBlur() {
      hasFocus = false;
      if (valid) {
        textOutputFunc(editText);
      } else {
        editText = originalText || '';
        valid = true;
      }
    },
    update(sourceText: string | undefined) {
      if (hasFocus) {
        return;
      }
      if (originalText !== sourceText) {
        originalText = sourceText;
        editText = originalText || '';
        valid = true;
      }
    },
  };
}

/*
//class version
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
*/

// reflect edit value to model on each type
export function createConfigTextEditModelDynamic(
  patterns: RegExp[],
  textMaxLength: number,
  procStartEdit: () => void,
  procEmitValidText: (text: string) => void,
  procEndEdit: () => void,
): IConfigTextEditModel {
  let originalText: string | undefined;
  let editText = '';
  let valid = true;
  let hasFocus = false;
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
      if (textMaxLength > 0 && text.length > textMaxLength) {
        valid = false;
      }
      if (valid) {
        originalText = editText;
        procEmitValidText(editText);
      }
    },
    onFocus() {
      procStartEdit();
      hasFocus = true;
    },
    onBlur() {
      procEndEdit();
      if (!valid) {
        editText = originalText || '';
        valid = true;
      }
      hasFocus = false;
    },
    update(sourceText: string | undefined) {
      if (hasFocus) {
        return;
      }
      if (originalText !== sourceText) {
        originalText = sourceText;
        editText = originalText || '';
        valid = true;
      }
    },
  };
}

/*
//class version
export class ConfigTextEditModelDynamic implements IConfigTextEditModel {
  originalValue: string | undefined;
  _editText: string = '';
  valid: boolean = true;

  constructor(
    private patterns: RegExp[],
    private procStartEdit: () => void,
    private procEmitValidText: (text: string) => void,
    private procEndEdit: () => void
  ) {}

  get editText() {
    return this._editText;
  }

  get disabled() {
    return this.originalValue === undefined;
  }

  onValueChanged = (text: string) => {
    this._editText = text;
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
      this._editText = this.originalValue || '';
      this.valid = true;
    }
  };

  update = (modelValue: string | undefined) => {
    if (this.originalValue !== modelValue) {
      this.originalValue = modelValue;
      this._editText = this.originalValue || '';
      this.valid = true;
    }
  };
}
*/

export interface IConfigTextEditModel2 {
  editText: string;
  valid: boolean;
  errorText: string;
  disabled: boolean;
  onValueChanged(text: string): void;
  onFocus(): void;
  onBlur(): void;
}

export function createConfigTextEditModelDynamic2(props: {
  procStartEdit: () => void;
  procEmitValidText: (text: string) => void;
  procEndEdit: () => void;
  sourceTextFeeder: () => string | undefined;
  checker: ((value: string) => string | undefined) | RegExp[];
}): () => IConfigTextEditModel2 {
  const {
    procStartEdit,
    procEmitValidText,
    procEndEdit,
    sourceTextFeeder,
    checker,
  } = props;

  let originalText: string | undefined;
  let editText = '';
  let valid = true;
  let hasFocus = false;
  let errorText: string | undefined;

  function onValueChanged(text: string) {
    editText = text;
    if (Array.isArray(checker)) {
      valid = checker.some((p) => text.match(p));
      if (!valid) {
        errorText = 'invalid value';
      }
    } else if (typeof checker === 'function') {
      errorText = checker(text);
      valid = errorText === undefined;
    } else {
      valid = false;
    }
    if (valid) {
      originalText = editText;
      procEmitValidText(editText);
    }
  }

  function onFocus() {
    procStartEdit();
    hasFocus = true;
  }

  function onBlur() {
    procEndEdit();
    if (!valid) {
      editText = originalText || '';
      valid = true;
      errorText = undefined;
    }
    hasFocus = false;
  }

  function update() {
    const sourceText = sourceTextFeeder();
    if (hasFocus) {
      return;
    }
    if (originalText !== sourceText) {
      originalText = sourceText;
      editText = originalText || '';
      valid = true;
      errorText = undefined;
    }
  }

  return () => {
    update();
    return {
      editText,
      errorText: errorText || '',
      valid,
      disabled: originalText === undefined,
      onValueChanged,
      onFocus,
      onBlur,
    };
  };
}
