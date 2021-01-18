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
