import { executeCommand, fsExistsSync, fsxCopyDirectory } from "./helpers";
import { deployStageIndexUpdator_updateIndexIfFilesChanged } from "./subTasks/deployStageIndexUpdator";
import { deployStageProjectsBuilder_buildProjects } from "./subTasks/deployStageProjectsBuilder";
import { deployStageFirmwareSummaryUpdator_outputSummaryFile } from "./subTasks/deployStageFirmwareSummaryUpdator";
import { packageSummaryUpdator_generateSummaryFile } from "./subTasks/packageSummaryUpdator";
import { rmSync } from "fs";

process.chdir("..");

function pullResourceStoreRepo() {
  if (!fsExistsSync("KRS")) {
    executeCommand(
      `git clone https://github.com/yahiro07/KermiteResourceStore.git KRS`
    );
  }
}

function copyResourcesToLocalResourceStoreRepo() {
  rmSync("./KRS/resources2", { recursive: true });
  fsxCopyDirectory("./dist", "./KRS/resources2");
}

function buildAllProjectDistributions() {
  pullResourceStoreRepo();
  const buildStats = deployStageProjectsBuilder_buildProjects();
  const successRate = buildStats.numSuccess / buildStats.numTotal;
  if (!(successRate > 0.9)) {
    console.log(`failed to build some projects, abort`);
    process.exit(-1);
  }
  const changeRes = deployStageIndexUpdator_updateIndexIfFilesChanged();
  deployStageFirmwareSummaryUpdator_outputSummaryFile(buildStats, changeRes);
  packageSummaryUpdator_generateSummaryFile();
  copyResourcesToLocalResourceStoreRepo();
  console.log("done");
}

buildAllProjectDistributions();
