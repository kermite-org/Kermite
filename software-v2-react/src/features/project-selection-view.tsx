import { Box } from "@mui/system";
import { FC, useState } from "react";

export const ProjectSelectionView: FC = () => {
  const [currentProjectId, setCurrentProjectId] = useState("aaa");
  const projectIds = ["aaa", "bbb", "ccc"];

  return (
    <Box
      display="inline-flex"
      flexDirection={"column"}
      border="solid 1px #888"
      minWidth={"100px"}
    >
      {projectIds.map((id) => (
        <Box
          key={id}
          onClick={() => setCurrentProjectId(id)}
          bgcolor={id === currentProjectId ? "#0CF" : "transparent"}
        >
          {id}
        </Box>
      ))}
    </Box>
  );
};
