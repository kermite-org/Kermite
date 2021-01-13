import { ICommonSelectorViewModel } from '@ui-layouter/controls';

export function makeSelectorModel<T extends string>(props: {
  sources: { [key in T]: string };
  reader: () => T | undefined;
  writer: (choiceId: T) => void;
}): ICommonSelectorViewModel {
  const { sources, reader, writer } = props;
  const options = (Object.keys(sources) as T[]).map((key) => ({
    id: key,
    text: sources[key],
  }));
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
