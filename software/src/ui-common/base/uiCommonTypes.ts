export interface ISelectorOption {
  id: string;
  text: string;
}
export interface ISelectorSource {
  options: ISelectorOption[];
  choiceId: string;
  setChoiceId(id: string): void;
}

export function makePlainSelectorOption(source: string): ISelectorOption {
  return {
    id: source,
    text: source,
  };
}
