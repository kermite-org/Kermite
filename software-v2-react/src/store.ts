import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const projectIdAtom = atomWithStorage("krm2_current_project_id", "");
export const assetPathAtom = atomWithStorage("krm2_current_asset_path", "");

export const useCurrentProjectId = () => useAtom(projectIdAtom);
