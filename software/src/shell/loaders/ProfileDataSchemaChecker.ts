import { profileFormatRevisionLatest } from '~/shared';
import {
  vArray,
  vBoolean,
  vNumber,
  vNumberRanged,
  vObject,
  vSchemaOneOf,
  vString,
  vValueEquals,
  vValueOneOf,
} from '~/shared/modules/SchemaValidationHelper';
import { persistEditKeyboardDesignSchemaChecker } from '~/shell/loaders/LayoutFileSchemaChecker';

const vAssignOperation = () =>
  vSchemaOneOf([
    vObject({
      type: vValueEquals('keyInput'),
      virtualKey: vString(),
      attachedModifiers: vNumberRanged(0x00, 0x0f),
    }),
    vObject({
      type: vValueEquals('layerCall'),
      targetLayerId: vString(),
      invocationMode: vValueOneOf([
        'hold',
        'turnOn',
        'turnOff',
        'toggle',
        'oneshot',
      ]),
    }),
    vObject({
      type: vValueEquals('layerClearExclusive'),
      targetExclusionGroup: vNumber(),
    }),
    vObject({
      type: vValueEquals('systemAction'),
      action: vString(),
      payloadValue: vNumber(),
    }),
  ]);

export const profileDataSchemaChecker = vObject({
  formatRevision: vValueEquals(profileFormatRevisionLatest),
  keyboardDesign: persistEditKeyboardDesignSchemaChecker,
  settings: vSchemaOneOf([
    vObject({
      assignType: vValueEquals('single'),
      useShiftCancel: vBoolean(),
    }),
    vObject({
      assignType: vValueEquals('dual'),
      useShiftCancel: vBoolean(),
      primaryDefaultTrigger: vValueOneOf(['down', 'tap']),
      useInterruptHold: vBoolean(),
      tapHoldThresholdMs: vNumber(),
    }),
  ]),
  layers: vArray(
    vObject({
      layerId: vString(),
      layerName: vString(),
      attachedModifiers: vNumberRanged(0x00, 0x0f),
      defaultScheme: vValueOneOf(['block', 'transparent']),
      exclusionGroup: vNumber(),
      initialActive: vBoolean(),
    }),
  ),
  // assigns: vObejectDictionary(
  //   vSchemaOneOf([
  //     vObject({ type: vValueEquals('block') }),
  //     vObject({ type: vValueEquals('transparent') }),
  //     vObject({
  //       type: vValueEquals('single'),
  //       op: vAssignOperation().optional,
  //     }),
  //     vObject({
  //       type: vValueEquals('dual'),
  //       primaryOp: vAssignOperation().optional,
  //       secondaryOp: vAssignOperation().optional,
  //       tertiaryOp: vAssignOperation().optional,
  //     }),
  //   ]),
  // ),
  assigns: vArray(
    vObject({
      layerId: vString(),
      keyId: vString(),
      usage: vSchemaOneOf([
        vObject({ type: vValueEquals('block') }),
        vObject({ type: vValueEquals('transparent') }),
        vObject({
          type: vValueEquals('single'),
          op: vAssignOperation().optional,
        }),
        vObject({
          type: vValueEquals('dual'),
          primaryOp: vAssignOperation().optional,
          secondaryOp: vAssignOperation().optional,
          tertiaryOp: vAssignOperation().optional,
        }),
      ]),
    }),
  ),
});

export function checkProfileDataObjectSchema(obj: any): string | undefined {
  const errors = profileDataSchemaChecker(obj);
  if (errors) {
    return JSON.stringify(errors, null, '  ');
  }
  return undefined;
}
