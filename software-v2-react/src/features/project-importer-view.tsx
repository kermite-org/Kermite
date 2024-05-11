import { Box } from "@mui/system";
import { FC } from "react";
import { useProjectImporterStore } from "./project-importer-store";

export const ProjectImporterView: FC = () => {
  const {
    allProjectIds,
    currentProjectId,
    setCurrentProjectId,
    currentPackage,
    importSelectedPackage,
  } = useProjectImporterStore();

  return (
    <Box>
      <Box>{currentPackage?.keyboardName ?? "--"}</Box>
      <Box>
        <button onClick={importSelectedPackage} disabled={!currentProjectId}>
          import
        </button>
      </Box>
      <Box
        display="inline-flex"
        flexDirection="column"
        border="solid 1px #888"
        minWidth="100px"
      >
        {allProjectIds.map((id) => (
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
    </Box>
  );
};
