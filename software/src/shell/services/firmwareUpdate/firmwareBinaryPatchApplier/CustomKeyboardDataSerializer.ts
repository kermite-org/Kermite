import { IKermiteStandardKeyboardSpec } from '~/shared';
import { PinNameToPinNumberMap } from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/DataTables';
import {
  convertArrayElementsToBytes,
  isStringPrintableAscii,
  padByteArray,
  stringToEmbedBytes,
} from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/Helpers';
import { IStandardKeyboardInjectedMetaData } from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/Types';

function mapPinNameToPinNumber(pinName: string | undefined): number {
  const pinNumber = PinNameToPinNumberMap[pinName || ''];
  return isFinite(pinNumber) ? pinNumber : -1;
}

export function serializeCustomKeyboardSpec(
  spec: IKermiteStandardKeyboardSpec,
  meta: IStandardKeyboardInjectedMetaData,
): number[] {
  let numMatrixColumns = 0;
  let numMatrixRows = 0;
  let numDirectWiredKeys = 0;
  const keyScannerPins: string[] = [];
  if (spec.useMatrixKeyScanner) {
    numMatrixColumns = spec.matrixColumnPins?.length || 0;
    numMatrixRows = spec.matrixRowPins?.length || 0;
    keyScannerPins.push(
      ...(spec.matrixColumnPins || []),
      ...(spec.matrixRowPins || []),
    );
  }
  if (spec.useDirectWiredKeyScanner) {
    numDirectWiredKeys = spec.directWiredPins?.length || 0;
    keyScannerPins.push(...(spec.directWiredPins || []));
  }

  const pinDefinitionsBytes = padByteArray(
    keyScannerPins.map(mapPinNameToPinNumber),
    32,
    0xff,
  );

  if (
    !(
      meta.keyboardName.length < 32 && isStringPrintableAscii(meta.keyboardName)
    )
  ) {
    throw new Error(
      `invalid keyboard name ${meta.keyboardName} for embedded attribute`,
    );
  }

  return convertArrayElementsToBytes([
    ...stringToEmbedBytes(meta.projectId, 7),
    ...stringToEmbedBytes(meta.variationId, 3),
    ...stringToEmbedBytes(meta.deviceInstanceCode, 9),
    ...stringToEmbedBytes(meta.keyboardName, 33),
    spec.useBoardLedsProMicroAvr,
    spec.useBoardLedsProMicroRp,
    spec.useBoardLedsRpiPico,
    spec.useDebugUart,
    spec.useMatrixKeyScanner,
    spec.useDirectWiredKeyScanner,
    spec.useEncoder,
    spec.useLighting,
    spec.useLcd,
    numMatrixColumns,
    numMatrixRows,
    numDirectWiredKeys,
    mapPinNameToPinNumber(spec.lightingPin),
    spec.lightingNumLeds,
    ...pinDefinitionsBytes,
  ]);
}
