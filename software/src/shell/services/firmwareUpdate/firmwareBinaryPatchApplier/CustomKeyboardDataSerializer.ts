import { IKermiteStandardKeyboardSpec } from '~/shared';
import { PinNameToPinNumberMap } from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/DataTables';
import {
  convertArrayElementsToBytes,
  padByteArray,
} from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/Helpers';

function mapPinNameToPinNumber(pinName: string): number {
  const pinNumber = PinNameToPinNumberMap[pinName];
  return isFinite(pinNumber) ? pinNumber : -1;
}

export function serializeCustomKeyboardSpec(
  spec: IKermiteStandardKeyboardSpec,
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

  return convertArrayElementsToBytes([
    spec.useBoardLedsProMicroAvr,
    spec.useBoardLedsProMicroRp,
    spec.useBoardLedsRpiPico,
    spec.useDebugUart,
    spec.useMatrixKeyScanner,
    spec.useDirectWiredKeyScanner,
    numMatrixColumns,
    numMatrixRows,
    numDirectWiredKeys,
    ...pinDefinitionsBytes,
  ]);
}