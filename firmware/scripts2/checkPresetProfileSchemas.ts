import * as glob from "glob";
import { fsxReadJsonFile } from "./osHelpers";
import {
  vArray,
  vBoolean,
  vNumber,
  vObejectDictionary,
  vObject,
  vSchemaOneOf,
  vString,
  vValueEquals,
  vValueOneOf,
} from "./schemaValidationHelper";

const failureStatusIfError = process.argv.includes("--failureStatusIfError");

process.chdir("..");

const vAssignOperation = () =>
  vSchemaOneOf([
    vObject({
      type: vValueEquals("keyInput"),
      virtualKey: vString(),
      attachedModifiers: vArray(
        vValueOneOf(["K_Ctrl", "K_Shift", "K_Alt", "K_OS"])
      ).optional,
    }),
    vObject({
      type: vValueEquals("layerCall"),
      targetLayerId: vString(),
      invocationMode: vValueOneOf([
        "hold",
        "turnOn",
        "turnOff",
        "toggle",
        "oneshot",
      ]),
    }),
  ]);

const profileJsonDataSchema = vObject({
  revision: vValueEquals("PRF02"),
  keyboardShape: vObject({
    breedName: vString(),
    keyUnits: vArray(
      vObject({
        id: vString(),
        x: vNumber(),
        y: vNumber(),
        r: vNumber(),
        keyIndex: vNumber(),
      })
    ),
    displayArea: vObject({
      centerX: vNumber(),
      centerY: vNumber(),
      width: vNumber(),
      height: vNumber(),
    }),
    bodyPathMarkups: vArray(vString()),
  }),
  assignType: vValueOneOf(["single", "double"]),
  settings: vObject({
    useShiftCancel: vBoolean().optional,
  }),
  layers: vArray(
    vObject({
      layerId: vString(),
      layerName: vString(),
      defaultScheme: vValueOneOf(["block", "transparent"]),
      exclusionGroup: vNumber(),
      initialActive: vBoolean(),
    })
  ),
  assigns: vObejectDictionary(
    vSchemaOneOf([
      vObject({ type: vValueEquals("block") }),
      vObject({ type: vValueEquals("transparent") }),
      vObject({
        type: vValueEquals("single"),
        op: vAssignOperation().optional,
      }),
      vObject({
        type: vValueEquals("deual"),
        primaryOp: vAssignOperation().optional,
        secondaryOp: vAssignOperation().optional,
        tertiaryOp: vAssignOperation().optional,
      }),
    ])
  ),
});

function checkPresets() {
  console.log("cheking preset json schemas ...");

  const filePaths = glob.sync("src/projects/**/presets/*.json");

  const results = filePaths
    .map((filePath) => {
      const obj = fsxReadJsonFile(filePath);
      const errors = profileJsonDataSchema(obj);
      return errors ? { filePath, errors } : undefined;
    })
    .filter((a) => !!a);

  if (results.length > 0) {
    console.log(`found schema errors`);
    console.log(JSON.stringify(results, null, "  "));
    if (failureStatusIfError) {
      process.exit(1);
    }
  } else {
    console.log("cheking preset json schemas ... ok");
  }
}

checkPresets();
