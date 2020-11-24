import { deployStageIndexUpdator_updateIndexIfFilesChanged } from "./deployStageIndexUpdator";
import { deployStageProjectsBuilder_buildProjects } from "./deployStageProjectsBuilder";
import { deployStageSummaryUpdator_outputSummaryFile } from "./deployStageSummaryUpdator";
import {
  executeCommand,
  fsExistsSync,
  fsRmdirSync,
  fsxCopyDirectory,
} from "./osHelpers";

process.chdir("..");

function pullResourceStoreRepo() {
  if (!fsExistsSync("KRS")) {
    executeCommand(
      `git clone https://github.com/yahiro07/KermiteResourceStore.git KRS`
    );
  }
}

function copyResourcesToLocalResourceStoreRepo() {
  fsRmdirSync("./KRS/resources", { recursive: true });
  fsxCopyDirectory("./dist", "./KRS/resources");
}

function buildAllProjectDistributions() {
  pullResourceStoreRepo();
  const buildStats = deployStageProjectsBuilder_buildProjects();
  const changeRes = deployStageIndexUpdator_updateIndexIfFilesChanged();
  deployStageSummaryUpdator_outputSummaryFile(buildStats, changeRes);
  copyResourcesToLocalResourceStoreRepo();
  console.log("done");
}

buildAllProjectDistributions();
