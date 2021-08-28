import { flattenArray, splitBytesN } from '~/shared';
import { replaceArrayContent } from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/Helpers';

const uf2Config = {
  blockSize: 512,
  blockHeaderSize: 32,
  blockPayloadLength: 256,
};

export function patchUf2FileContent(
  uf2FileContentBytes: number[],
  callback: (binaryBytes: number[]) => void,
): number[] {
  const { blockSize, blockHeaderSize, blockPayloadLength } = uf2Config;

  const blocks = splitBytesN(uf2FileContentBytes, blockSize);

  const srcPayloads = blocks.map((block) =>
    block.slice(blockHeaderSize, blockHeaderSize + blockPayloadLength),
  );
  const binaryBytes = flattenArray(srcPayloads);
  callback(binaryBytes);
  const modPayloads = splitBytesN(binaryBytes, blockPayloadLength);

  blocks.forEach((block, i) => replaceArrayContent(block, 32, modPayloads[i]));

  return flattenArray(blocks);
}
