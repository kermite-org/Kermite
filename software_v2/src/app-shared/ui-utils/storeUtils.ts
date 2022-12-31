import { compareArray } from '../app-utils';

export function createSimpleSelector<TSource, TResult>(
  sourceReader: () => TSource,
  transformer: (source: TSource) => TResult,
): () => TResult {
  let source: TSource | undefined | null = null;
  let result: TResult | undefined;

  return () => {
    const _source = sourceReader();
    if (source === null || _source !== source) {
      result = transformer(_source);
      source = _source;
    }
    return result!;
  };
}

export function createSimpleSelector2<T extends any[], R>(
  transformer: (...args: [...T]) => R,
  sourceReader: () => [...T],
): () => R {
  let source: T | undefined;
  let result: R | undefined;

  return () => {
    const _source = sourceReader();
    if (!source || !compareArray(_source, source)) {
      result = transformer(..._source);
      source = _source;
    }
    return result!;
  };
}
