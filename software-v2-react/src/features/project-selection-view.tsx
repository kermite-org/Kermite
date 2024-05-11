import { Box } from "@mui/system";
import { FC } from "react";
import { useAsyncResource } from "../auxiliaries/utils-react/hooks";
import { bucketDb } from "../core/bucket-db-instance";
import { useBucketDbRevision } from "../core/bucket-db-notifier";
import { useCurrentAssetPath, useCurrentProjectId } from "../store";

const m = {
  async loadLocalProjectIds() {
    return [...(await bucketDb.project.listKeys()), ""];
  },
};

export const ProjectSelectionView: FC = () => {
  const [currentProjectId, setCurrentProjectId] = useCurrentProjectId();
  const [, setCurrentAssetPath] = useCurrentAssetPath();
  const dbRevision = useBucketDbRevision();
  const projectIds =
    useAsyncResource(m.loadLocalProjectIds, [dbRevision]) ?? [];

  const handleLoadProject = (projectId: string) => {
    setCurrentProjectId(projectId);
    setCurrentAssetPath("");
  };

  return (
    <Box flexDirection={"column"} border="solid 1px #888" minWidth={"100px"}>
      {projectIds.map((id) => (
        <Box
          key={id}
          onClick={() => handleLoadProject(id)}
          bgcolor={id === currentProjectId ? "#0CF" : "transparent"}
          sx={{ cursor: "pointer" }}
        >
          {id || "--"}
        </Box>
      ))}
    </Box>
  );
};
