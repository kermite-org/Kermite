import { atom, useAtomValue, useSetAtom } from "jotai";

const revisionCountAtom = atom(0);

export const useBucketDbRevision = () => {
  const count = useAtomValue(revisionCountAtom);
  return count;
};

export const useBucketDbNotifier = () => {
  const setCount = useSetAtom(revisionCountAtom);
  const notify = () => setCount((prev) => prev + 1);
  return { notify };
};
