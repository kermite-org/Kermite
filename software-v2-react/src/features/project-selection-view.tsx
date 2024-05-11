import { Box } from "@mui/system";
import { FC } from "react";
import { useAsyncResource } from "../auxiliaries/utils-react/hooks";
import { bucketDb } from "../core/bucket-db-instance";
import { useBucketDbRevision } from "../core/bucket-db-notifier";
import { useCurrentAssetPath, useCurrentProjectId } from "../store";

type IProjectItem = {
  projectId: string;
  keyboardName: string;
};

const m = {
  async loadLocalProjectIds(): Promise<IProjectItem[]> {
    const items = await bucketDb.project.getAll();
    return [
      ...items.map((item) => ({
        projectId: item.path,
        keyboardName: item.value.keyboardName,
      })),
      { projectId: "", keyboardName: "--" },
    ];
  },
};

export const ProjectSelectionView: FC = () => {
  const [currentProjectId, setCurrentProjectId] = useCurrentProjectId();
  const [, setCurrentAssetPath] = useCurrentAssetPath();
  const dbRevision = useBucketDbRevision();
  const projectItems =
    useAsyncResource(m.loadLocalProjectIds, [dbRevision]) ?? [];

  const handleLoadProject = (projectId: string) => {
    setCurrentProjectId(projectId);
    setCurrentAssetPath("");
  };

  return (
    <Box flexDirection="column" border="solid 1px #888" minWidth="100px">
      {projectItems.map((item) => (
        <Box
          key={item.projectId}
          onClick={() => handleLoadProject(item.projectId)}
          bgcolor={item.projectId === currentProjectId ? "#0CF" : "transparent"}
          sx={{ cursor: "pointer" }}
          maxWidth="110px"
          whiteSpace="nowrap"
          overflow="hidden"
        >
          {item.keyboardName}
        </Box>
      ))}
    </Box>
  );
};
