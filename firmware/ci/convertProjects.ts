import * as fs from "fs";
import {
  fsxListFileBaseNames,
  fsxReadJsonFile,
  fsxWriteJsonFile,
  pathJoin,
} from "./helpers";
const baseDir = "../projects_next";

const folderNames = fs.readdirSync(baseDir);
// console.log({ folderNames });

for (const folderName of folderNames) {
  const folderPath = pathJoin(baseDir, folderName);
  const projectJsonFilePath = pathJoin(folderPath, "project.json");
  const projectObj = fsxReadJsonFile(projectJsonFilePath);
  const profileNames = fsxListFileBaseNames(folderPath, ".profile.json");
  const layoutNames = fsxListFileBaseNames(folderPath, ".layout.json");

  const layouts = layoutNames.map((layoutName) => {
    const filePath = pathJoin(folderPath, layoutName + ".layout.json");
    const data = fsxReadJsonFile(filePath);
    return {
      layoutName,
      data,
    };
  });
  const profiles = profileNames.map((profileName) => {
    const filePath = pathJoin(folderPath, profileName + ".profile.json");
    const data = fsxReadJsonFile(filePath);
    return {
      profileName,
      data,
    };
  });
  const savingFileName = pathJoin(baseDir, `${folderName}.kmpkg.json`);
  const outputProjectJsonContent = {
    ...projectObj,
    layouts,
    profiles,
  };
  fsxWriteJsonFile(savingFileName, outputProjectJsonContent);
}
console.log("done");
