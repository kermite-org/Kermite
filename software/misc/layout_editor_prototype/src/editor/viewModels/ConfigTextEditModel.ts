export class ConfigTextEditModel {
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
