import * as glob from "glob";
import { fsxReadJsonFile } from "./osHelpers";
import {
  vArray,
  vNumber,
  vObject,
  vString,
  vStringProjectId,
} from "./schemaValidationHelper";

process.chdir("..");

const layoutJsonDataValidator = vObject({
  projectId: vStringProjectId(),
  projectName: vString(20),
  displayArea: vObject({
    centerX: vNumber(),
    centerY: vNumber(),
    width: vNumber(),
    height: vNumber(),
  }),
  keyUnits: vArray(
    vObject({
      id: vString(10),
      x: vNumber(),
      y: vNumber(),
      r: vNumber(),
      keyIndex: vNumber(),
    })
  ),
  bodyPathMarkups: vArray(vString()),
});

function checkProjects() {
  console.log("cheking project json schemas ...");

  const filePaths = glob.sync("src/projects/**/*/*layout.json");

  const results = filePaths
    .map((filePath) => {
      const obj = fsxReadJsonFile(filePath);
      const errors = layoutJsonDataValidator(obj);
      return errors ? { filePath, errors } : undefined;
    })
    .filter((a) => !!a);

  if (results.length > 0) {
    console.log(`found schema errors`);
    console.log(JSON.stringify(results, null, "  "));
    process.exit(1);
  }

  console.log("cheking project json schemas ... ok");
}

checkProjects();
