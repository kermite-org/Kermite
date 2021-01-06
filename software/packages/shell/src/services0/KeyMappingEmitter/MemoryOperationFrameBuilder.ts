import { generateNumberSequence } from '~shared/funcs/Utils';
import { bhi, blo } from './Helpers';

// ------------------------------------------------------------

export const memoryWriteTransactionStartFrame = [0xb0, 0x01, 0x10];

export const memoryWriteTransactionEndFrame = [0xb0, 0x01, 0x11];

export function makeMemoryWriteOperationFrames(
  bytes: number[],
  dataKind: 'keyMapping',
): number[][] {
  const sz = 64 - 6;
  const numFrames = Math.ceil(bytes.length / sz);
  const dataKindByte = (dataKind === 'keyMapping' && 0x01) || 0;

  return generateNumberSequence(numFrames).map((k) => {
    const addr = k * sz;
    const data = bytes.slice(addr, addr + sz);
    return [
      0xb0,
      dataKindByte,
      0x20,
      bhi(addr),
      blo(addr),
      data.length,
      ...data,
    ];
  });
}

export function makeMemoryChecksumRequestFrame(
  dataKind: 'keyMapping',
  addr: number,
  length: number,
): number[] {
  const dataKindByte = (dataKind === 'keyMapping' && 0x01) || 0;
  return [
    0xb0,
    dataKindByte,
    0x21,
    bhi(addr),
    blo(addr),
    bhi(length),
    blo(length),
  ];
}

// ------------------------------------------------------------
