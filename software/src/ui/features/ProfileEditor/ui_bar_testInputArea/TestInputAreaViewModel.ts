interface ITestInputAreaViewModel {
  text: string;
  setText(text: string): void;
  clearText(): void;
}

export function makeTestInputAreaViewModel(): ITestInputAreaViewModel {
  let text = '';
  return {
    get text() {
      return text;
    },
    setText(value: string) {
      text = value;
    },
    clearText() {
      text = '';
    },
  };
}
