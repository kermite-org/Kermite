import { ICommonSelectorViewModel } from '~/fe-shared';

export function makeSelectorModel<T extends string>(props: {
  sources: [T, string][];
  reader: () => T | undefined;
  writer: (value: T) => void;
}): ICommonSelectorViewModel {
  const { sources, reader, writer } = props;
  const options = sources.map(([value, label]) => ({ value, label }));
  return {
    options,
    get value() {
      return reader() || '';
    },
    get disabled() {
      return reader() === undefined;
    },
    setValue: writer,
  };
}
