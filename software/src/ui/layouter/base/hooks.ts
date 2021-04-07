import { Hook } from 'qx';

export function useClosureModel<T>(creator: () => () => T) {
  const model = Hook.useMemo(creator, []);
  return model();
}
