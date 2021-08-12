import { IKermiteStandardKeyboaredRawSpec } from '@/CoreDefinitions';

function makeOutputBytes(arr: (number | boolean | undefined)[]): number[] {
  return arr.map((value) => {
    if (value === undefined) {
      return 0;
    }
    if (value === false) {
      return 0;
    }
    if (value === true) {
      return 1;
    }
    if (isFinite(value)) {
      return value;
    }
    return 0;
  });
}

function padZeros(bytes: number[] | undefined, length: number): number[] {
  return new Array(length).fill(0).map((_, i) => bytes?.[i] || 0);
}

export function serializeCustomKeyboardSpec(
  spec: IKermiteStandardKeyboaredRawSpec
): number[] {
  return makeOutputBytes([
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
