import {
  vArray,
  vBoolean,
  vNumber,
  vObject,
  vNaturalInteger,
  vSchemaOneOf,
  vString,
  vStringMatchesTo,
  vValueOneOf,
} from '~/shell/modules/SchemaValidationHelper';

const persistEditKeyboardDesignSchemaChecker = vObject({
  setup: vObject({
    placementUnit: vStringMatchesTo([/^mm$/, /^KP \d+( \d+)?$/]),
    placementAnchor: vValueOneOf(['center', 'topLeft']),
    keySizeUnit: vValueOneOf(['mm', 'KP']),
    keyIdMode: vValueOneOf(['auto', 'manual']),
  }),
  outlineShapes: vArray(
    vObject({
      points: vArray(
        vObject({
          x: vNumber(),
          y: vNumber(),
        }),
      ),
      groupIndex: vNaturalInteger().optional,
    }),
  ),
  keyEntities: vArray(
    vSchemaOneOf([
      vObject({
        keyId: vString(),
        x: vNumber(),
        y: vNumber(),
        angle: vNumber(),
        shape: vStringMatchesTo([/^std \d+( \d+)?$/, /^circle$/, /^isoEnter$/]),
        keyIndex: vNaturalInteger().optional,
        groupIndex: vNaturalInteger().optional,
      }),
      vObject({
        keyId: vString(),
        mirrorOf: vString(),
        keyIndex: vNaturalInteger().optional,
      }),
    ]),
  ),
  transGroups: vArray(
    vObject({
      x: vNumber(),
      y: vNumber(),
      angle: vNumber(),
      mirror: vBoolean().optional,
    }),
  ),
});

export function checkLayoutFileContentObjectSchema(
  obj: any,
): string | undefined {
  const errors = persistEditKeyboardDesignSchemaChecker(obj);
  if (errors) {
    return JSON.stringify(errors, null, '  ');
  }
  return undefined;
}
