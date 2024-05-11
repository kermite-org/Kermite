import { Box } from "@mui/system";
import { ProjectImporterView } from "./features/project-importer-view";
import { ProjectResourceListView } from "./features/project-resource-list-view";
import { ProjectSelectionView } from "./features/project-selection-view";
import { ProjectMenuView } from "./features/project-menu-view";

function App() {
  return (
    <Box display="flex">
      <ProjectImporterView />
      <div>
        <ProjectSelectionView />
        <ProjectMenuView />
      </div>
      <ProjectResourceListView />
    </Box>
  );
}

export default App;
