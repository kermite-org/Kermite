import { flattenArray, splitBytesN } from '~/shared';

function calcHexRowChecksum(values: number[]): number {
  const sum = values.reduce((s, v) => s + v, 0);
  return (~sum + 1) & 0xff;
}

function decodeBytesFromHexFileContent(hexFileContentText: string): number[] {
  const lines = hexFileContentText.split(/\r?\n/);
  lines.pop();

  const blocks = lines.map((line) => {
    const bytesStr = line.slice(1);
    const numBytes = bytesStr.length / 2;
    const bytes = new Array(numBytes).fill(0).map((_, i) => {
      const byteStr = bytesStr.slice(i * 2, i * 2 + 2);
      return parseInt(byteStr, 16);
    });
    const len = bytes[0];
    return bytes.slice(4, 4 + len);
  });
  return flattenArray(blocks);
}

function encodeBytesToHexFileContent(binaryBytes: number[]): string {
  const blocks = splitBytesN(binaryBytes, 16);

  let position = 0;
  const lines = blocks.map((block) => {
    const addr = position;
    const size = block.length;
    const recordType = 0;
    const dataBody = [
      size,
      (addr >> 8) & 0xff,
      addr & 0xff,
      recordType,
      ...block,
    ];
    const checksum = calcHexRowChecksum(dataBody);
    const bytes = [...dataBody, checksum];
    position += size;
    return (
      ':' +
      bytes
        .map((byte) => ('00' + byte.toString(16)).slice(-2).toUpperCase())
        .join('')
    );
  });
  lines.push(':00000001FF');
  return lines.join('\n');
}

export function patchHexFileContent(
  buffer: Uint8Array,
  callback: (binaryBytes: number[]) => void,
): Uint8Array {
  const hexFileContentText = new TextDecoder().decode(buffer);
  const binaryBytes = decodeBytesFromHexFileContent(hexFileContentText);
  callback(binaryBytes);
  const modHexFileContentText = encodeBytesToHexFileContent(binaryBytes);
  return new TextEncoder().encode(modHexFileContentText);
}
