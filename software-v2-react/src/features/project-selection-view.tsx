import { Box } from "@mui/system";
import { useAtom } from "jotai/react";
import { atomWithStorage } from "jotai/utils";
import { FC } from "react";

const projectIdAtom = atomWithStorage("krm2_currentProjectId", "aaa");

export const ProjectSelectionView: FC = () => {
  const [currentProjectId, setCurrentProjectId] = useAtom(projectIdAtom);
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
          sx={{ cursor: "pointer" }}
        >
          {id}
        </Box>
      ))}
    </Box>
  );
};
