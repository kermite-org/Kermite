import { generateNumberSequence } from '~/shared';
import { bhi, blo } from '~/shell/services/firmwareUpdation/helpers';

export class Packets {
  static deviceAttributesRequestFrame = [0xf0, 0x10];

  static makeSideBrainModeSpecFrame(enabled: boolean) {
    return [0xd0, 0x10, enabled ? 1 : 0];
  }

  static makeSideBrainHidReportFrame(report: number[]) {
    return [0xd0, 0x20, ...report];
  }

  // ------------------------------------------------------------

  static memoryWriteTransactionStartFrame = [0xb0, 0x01, 0x10];

  static memoryWriteTransactionEndFrame = [0xb0, 0x01, 0x11];

  static makeMemoryWriteOperationFrames(
    bytes: number[],
    dataKind: 'keyMapping',
  ): number[][] {
    const sz = 64 - 6;
    const numFrames = Math.ceil(bytes.length / sz);
    const dataKindByte = (dataKind === 'keyMapping' && 0x01) || 0;

    return generateNumberSequence(numFrames).map((k) => {
      const offset = k * sz;
      const data = bytes.slice(offset, offset + sz);
      return [
        0xb0,
        dataKindByte,
        0x20,
        bhi(offset),
        blo(offset),
        data.length,
        ...data,
      ];
    });
  }

  static makeMemoryChecksumRequestFrame(
    dataKind: 'keyMapping',
    offset: number,
    length: number,
  ): number[] {
    const dataKindByte = (dataKind === 'keyMapping' && 0x01) || 0;
    return [
      0xb0,
      dataKindByte,
      0x21,
      bhi(offset),
      blo(offset),
      bhi(length),
      blo(length),
    ];
  }
}
