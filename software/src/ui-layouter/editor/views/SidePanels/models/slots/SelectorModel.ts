import { ICommonSelectorViewModel } from '@ui-layouter/controls';

export function makeSelectorModel<T extends string>(props: {
  sources: [string, string][];
  reader: () => T | undefined;
  writer: (choiceId: T) => void;
}): ICommonSelectorViewModel {
  const { sources, reader, writer } = props;
  const options = sources.map(([id, text]) => ({ id, text }));
  return {
    options,
    get choiceId() {
      return reader() || '';
    },
    get disabled() {
      return reader() === undefined;
    },
    setChoiceId: writer,
  };
}
