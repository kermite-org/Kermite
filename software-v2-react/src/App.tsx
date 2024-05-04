import { Box } from "@mui/system";
import { useEffect } from "react";
import { ProjectImporterView } from "./features/project-importer-view";
import { ProjectSelectionView } from "./features/project-selection-view";

async function apiDev() {
  const res = await fetch(`https://server.kermite.org/api/packages/catalog`);
  const obj = await res.json();
  console.log({ res, obj });

  const res2 = await fetch(
    `https://server.kermite.org/api/packages/projects/79xv6Z`
  );
  const obj2 = await res2.json();
  console.log({ res2, obj2 });
}

function App() {
  useEffect(() => {
    // void apiDev();
  }, []);
  return (
    <Box display={"flex"}>
      <ProjectImporterView />
      <ProjectSelectionView />
    </Box>
  );
}

export default App;
