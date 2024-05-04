import { atomWithStorage } from "jotai/utils";

export const projectIdAtom = atomWithStorage("krm2_current_project_id", "");
export const assetPathAtom = atomWithStorage("krm2_current_asset_path", "");
