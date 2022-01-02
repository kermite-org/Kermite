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
} from '~/shared';

export const persistEditKeyboardDesignSchemaChecker = vObject({
  formatRevision: vString(),
  setup: vObject({
    placementUnit: vStringMatchesTo([/^mm$/, /^KP [\d.]+( [\d.]+)?$/]),
    placementAnchor: vValueOneOf(['center', 'topLeft']),
    keySizeUnit: vStringMatchesTo([/^mm$/, /^KP [\d.]+( [\d.]+)?$/]),
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
        angle: vNumber().optional,
        shape: vStringMatchesTo([
          /^std [\d.]+( [\d.]+)?$/,
          // /^ext circle$/,
          /^ext isoEnter$/,
        ]).optional,
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
  transformationGroups: vArray(
    vObject({
      x: vNumber(),
      y: vNumber(),
      angle: vNumber().optional,
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
