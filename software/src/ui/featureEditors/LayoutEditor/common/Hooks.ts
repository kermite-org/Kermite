import { useMemo } from 'alumina';

export function useClosureModel<T>(creator: () => () => T) {
  const model = useMemo(creator, []);
  return model();
}
