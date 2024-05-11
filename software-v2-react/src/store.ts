import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const projectIdAtom = atomWithStorage("krm2_current_project_id", "");
const assetPathAtom = atomWithStorage("krm2_current_asset_path", "");

export const useCurrentProjectId = () => useAtom(projectIdAtom);
export const useCurrentAssetPath = () => useAtom(assetPathAtom);
