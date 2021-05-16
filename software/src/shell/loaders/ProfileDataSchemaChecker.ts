import { profileFormatRevisionLatest } from '~/shared';
import {
  vArray,
  vBoolean,
  vNumber,
  vObject,
  vSchemaOneOf,
  vString,
  vValueEquals,
  vValueOneOf,
} from '~/shared/modules/SchemaValidationHelper';
import { persistEditKeyboardDesignSchemaChecker } from '~/shell/loaders/LayoutFileSchemaChecker';

const vModiferKey = vValueOneOf(['K_Ctrl', 'K_Shift', 'K_Alt', 'K_Gui']);

const vAssignOperation = () =>
  vSchemaOneOf([
    vObject({
      type: vValueEquals('keyInput'),
      virtualKey: vString(),
      attachedModifiers: vArray(vModiferKey).optional,
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
      type: vValueEquals('modifierCall'),
      modiferKey: vModiferKey,
      isOneShot: vBoolean(),
    }),
    vObject({
      type: vValueEquals('layerClearExclusive'),
      targetExclusionGroup: vNumber(),
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
      attachedModifiers: vArray(
        vValueOneOf(['K_Ctrl', 'K_Shift', 'K_Alt', 'K_Gui']),
      ).optional,
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
