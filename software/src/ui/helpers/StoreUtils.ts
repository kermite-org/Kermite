import { compareArray } from '~/shared';

export function createSimpleSelector<TSource, TResult>(
  sourceReader: () => TSource,
  transformer: (source: TSource) => TResult,
): () => TResult {
  let source: TSource | undefined;
  let result: TResult | undefined;

  return () => {
    const _source = sourceReader();
    if (_source !== source) {
      result = transformer(_source);
      source = _source;
    }
    return result!;
  };
}

export function createSimpleSelector2<T extends (...args: any[]) => any>(
  transformer: T,
  sourceReader: () => Parameters<T>,
): () => ReturnType<T> {
  let source: Parameters<T> | undefined;
  let result: ReturnType<T> | undefined;

  return () => {
    const _source = sourceReader();
    if (!source || !compareArray(_source, source)) {
      result = transformer(..._source);
      source = _source;
    }
    return result!;
  };
}
