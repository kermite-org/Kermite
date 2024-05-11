import { Box } from "@mui/system";
import { useAtom } from "jotai/react";
import { FC } from "react";
import { useAsyncResource } from "../auxiliaries/utils-react/hooks";
import { bucketDb } from "../core/bucket-db-instance";
import { projectIdAtom } from "../store";
import { useBucketDbRevision } from "../core/bucket-db-notifier";

const m = {
  async loadLocalProjectIds() {
    return await bucketDb.project.listKeys();
  },
};

export const ProjectSelectionView: FC = () => {
  const [currentProjectId, setCurrentProjectId] = useAtom(projectIdAtom);
  const dbRevision = useBucketDbRevision();
  const projectIds =
    useAsyncResource(m.loadLocalProjectIds, [dbRevision]) ?? [];

  return (
    <Box flexDirection={"column"} border="solid 1px #888" minWidth={"100px"}>
      {projectIds.map((id) => (
        <Box
          key={id}
          onClick={() => setCurrentProjectId(id)}
          bgcolor={id === currentProjectId ? "#0CF" : "transparent"}
          sx={{ cursor: "pointer" }}
        >
          {id}
        </Box>
      ))}
    </Box>
  );
};
