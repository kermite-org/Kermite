import { flattenArray, splitBytesN } from '~/shared';
import { replaceArrayContent } from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/Helpers';

const uf2Config = {
  blockSize: 512,
  blockHeaderSize: 32,
  blockPayloadLength: 256,
};

export function patchUf2FileContent(
  buffer: Uint8Array,
  callback: (binaryBytes: number[]) => void,
): Uint8Array {
  const { blockSize, blockHeaderSize, blockPayloadLength } = uf2Config;

  const fileContentBytes = [...new Uint8Array(buffer)];
  const blocks = splitBytesN(fileContentBytes, blockSize);

  const srcPayloads = blocks.map((block) =>
    block.slice(blockHeaderSize, blockHeaderSize + blockPayloadLength),
  );
  const binaryBytes = flattenArray(srcPayloads);
  callback(binaryBytes);
  const modPayloads = splitBytesN(binaryBytes, blockPayloadLength);

  blocks.forEach((block, i) => replaceArrayContent(block, 32, modPayloads[i]));

  return new Uint8Array(flattenArray(blocks));
}
