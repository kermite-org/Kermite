import { fsxReadJsonFile, globSync } from "./osHelpers";
import {
  Checker,
  vArray,
  vNumber,
  vObject,
  vString,
  vStringProjectId,
} from "./schemaValidationHelper";

process.chdir("..");

const projectJsonDataValidator = vObject({
  projectId: vStringProjectId(),
  keyboardName: vString(20),
});

const layoutJsonDataValidator = vObject({
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

function checkFiles(target: string, globPttern: string, validator: Checker) {
  console.log(`cheking ${target} json schemas ...`);

  const filePaths = globSync(globPttern);
  // console.log("target files", filePaths);

  const results = filePaths
    .map((filePath) => {
      const obj = fsxReadJsonFile(filePath);
      const errors = validator(obj);
      return errors ? { filePath, errors } : undefined;
    })
    .filter((a) => !!a);

  if (results.length > 0) {
    console.log(`found schema errors`);
    console.log(JSON.stringify(results, null, "  "));
    process.exit(1);
  }

  console.log(`cheking ${target} json schemas ... ok`);
}

function projectJsonSchemaCheckerEntry() {
  checkFiles(
    "project",
    "src/projects/**/*/project.json",
    projectJsonDataValidator
  );
  checkFiles(
    "layout",
    "src/projects/**/*/*layout.json",
    layoutJsonDataValidator
  );
}

projectJsonSchemaCheckerEntry();
