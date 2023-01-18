import { ILayoutGeneratorOptions, makePlainSelectorOption } from '~/ui/base';

export type IWriteLayoutOptionFunc = <K extends keyof ILayoutGeneratorOptions>(
  key: K,
  value: ILayoutGeneratorOptions[K],
) => void;

export function useLayoutGeneratorOptionsPartModelEx(
  writeLayoutOption: IWriteLayoutOptionFunc,
) {
  const placementModeOptions = ['topLeft', 'center'].map(
    makePlainSelectorOption,
  );

  const valueChangeHandler =
    <K extends keyof ILayoutGeneratorOptions>(key: K) =>
    (value: ILayoutGeneratorOptions[K]) =>
      writeLayoutOption(key, value);

  return {
    placementModeOptions,
    valueChangeHandler,
  };
}
