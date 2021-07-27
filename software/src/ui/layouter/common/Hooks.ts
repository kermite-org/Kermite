import { useMemo } from 'qx';

export function useClosureModel<T>(creator: () => () => T) {
  const model = useMemo(creator, []);
  return model();
}
