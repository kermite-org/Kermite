import {
  profileFormatRevisionLatest,
  vArray,
  vBoolean,
  vNumber,
  vNumberRanged,
  vObject,
  vSchemaOneOf,
  vString,
  vValueEquals,
  vValueOneOf,
} from '~/shared';
import { persistEditKeyboardDesignSchemaChecker } from '~/shell/loaders/layoutFileSchemaChecker';

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
    vObject({
      type: vValueEquals('consumerControl'),
      action: vString(),
    }),
  ]);

export const profileDataSchemaChecker = vObject({
  formatRevision: vValueEquals(profileFormatRevisionLatest),
  keyboardDesign: persistEditKeyboardDesignSchemaChecker,
  settings: vSchemaOneOf([
    vObject({
      assignType: vValueEquals('single'),
      shiftCancelMode: vValueOneOf(['none', 'shiftLayer', 'all']),
    }),
    vObject({
      assignType: vValueEquals('dual'),
      shiftCancelMode: vValueOneOf(['none', 'shiftLayer', 'all']),
      primaryDefaultTrigger: vValueOneOf(['down', 'tap']),
      secondaryDefaultTrigger: vValueOneOf(['down', 'hold']),
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
  // assigns: vObjectDictionary(
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
