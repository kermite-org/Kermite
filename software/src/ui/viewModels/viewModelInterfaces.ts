export interface ISelectorSource {
  options: {
    id: string;
    text: string;
  }[];
  choiceId: string;
  setChoiceId(id: string): void;
}
