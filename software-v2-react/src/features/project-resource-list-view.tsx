import { Box } from "@mui/system";
import { useAtom } from "jotai";
import { FC } from "react";
import { useAsyncResource } from "../auxiliaries/utils-react/hooks";
import { bucketDb } from "../core/bucket-db-instance";
import { assetPathAtom, useCurrentProjectId } from "../store";

type IAssetItem = {
  assetPath: string;
  displayName: string;
};

const m = {
  async loadLocalProjectAssetItems(projectId: string): Promise<IAssetItem[]> {
    const packageItemPaths = await bucketDb.projectAsset.listKeys(
      `${projectId}/`
    );
    return packageItemPaths.map((path) => ({
      assetPath: `@base-package|${path}`,
      displayName: path.split("/").at(-1)!,
    }));
  },
};

export const ProjectResourceListView: FC = () => {
  const [currentProjectId] = useCurrentProjectId();
  const assetItems =
    useAsyncResource(
      () => m.loadLocalProjectAssetItems(currentProjectId),
      [currentProjectId]
    ) ?? [];
  const [currentAssetPath, setCurrentAssetPath] = useAtom(assetPathAtom);

  return (
    <Box flexDirection={"column"} border="solid 1px #888" minWidth={"100px"}>
      {assetItems.map((item) => (
        <Box
          key={item.assetPath}
          onClick={() => setCurrentAssetPath(item.assetPath)}
          bgcolor={item.assetPath === currentAssetPath ? "#0CF" : "transparent"}
          sx={{ cursor: "pointer" }}
        >
          {item.assetPath}
        </Box>
      ))}
    </Box>
  );
};
