import { IKermiteStandardKeyboaredRawSpec } from '@/CoreDefinitions';
import { convertArrayElementsToBytes, padZeros } from '@/Helpers';

export function serializeCustomKeyboardSpec(
  spec: IKermiteStandardKeyboaredRawSpec
): number[] {
  return convertArrayElementsToBytes([
    spec.useBoardLedsProMicroAvr,
    spec.useBoardLedsProMicroRp,
    spec.useBoardLedsRpiPico,
    spec.useDebugUart,
    spec.useMatrixKeyScanner,
    spec.useDirectWiredKeyScanner,
    spec.numMatrixColumns,
    spec.numMatrixRows,
    spec.numDirectWiredKeys,
    ...padZeros(spec.keyScannerPins, 32),
  ]);
}
