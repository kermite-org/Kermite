import * as fs from 'fs';

interface IHexRecord {
  byteCount: number;
  address: number;
  recordType: number;
  data: number[];
  checksum: number;
}

const ERR_INVALID_HEX_FORMAT = 'invalid hex file format';

function throwInvalidHexFileFormatError() {
  throw new Error(ERR_INVALID_HEX_FORMAT);
}

function converHexStringSequenceToBytes(str: string): number[] {
  if (str.length % 2 !== 0) {
    throwInvalidHexFileFormatError();
  }
  const bytes: number[] = [];
  for (let i = 0; i < str.length / 2; i++) {
    const code = str.slice(i * 2, i * 2 + 2);
    const num = parseInt(code, 16);
    if (!isFinite(num)) {
      throwInvalidHexFileFormatError();
    }
    bytes.push(num);
  }
  return bytes;
}

function calcChecksum(values: number[]): number {
  return (~(values.reduce((s, v) => s + v, 0) & 0xff) + 1) & 0xff;
}

function createHexRecord(line: string): IHexRecord {
  const startCodeStr = line.slice(0, 1);
  if (startCodeStr !== ':') {
    throwInvalidHexFileFormatError();
  }
  const lineBodyStr = line.slice(1);
  const bytes = converHexStringSequenceToBytes(lineBodyStr);

  const byteCount = bytes[0];
  const address = (bytes[1] << 8) | bytes[2];
  const recordType = bytes[3];

  const data = bytes.slice(4, bytes.length - 1);
  const checksum = bytes[bytes.length - 1];

  if (data.length !== byteCount) {
    throwInvalidHexFileFormatError();
  }
  const checksumCalcurated = calcChecksum(bytes.slice(0, bytes.length - 1));

  if (checksumCalcurated !== checksum) {
    throwInvalidHexFileFormatError();
  }

  return {
    byteCount,
    address,
    recordType,
    data,
    checksum
  };
}

function checkEndOfFileRecord(record: IHexRecord) {
  return (
    record.byteCount === 0 &&
    record.address === 0 &&
    record.recordType === 0x01 &&
    record.data.length === 0
  );
}

function checkHexLineRecordsValid(records: IHexRecord[]) {
  //ensure hex file contains only one sequential data block
  let pos = 0;
  for (let i = 0; i < records.length - 1; i++) {
    const record = records[i];
    if (record.address !== pos) {
      return false;
    }
    pos += record.byteCount;
  }
  return true;
}

function extractCodeBytesFromHexRecords(records: IHexRecord[]) {
  const bytes: number[] = [];
  records.forEach((record) => bytes.push(...record.data));
  return bytes;
}

function sliceCodeBytesIntoBlocks(bytes: number[], n: number) {
  const m = Math.ceil(bytes.length / n);
  return Array(m)
    .fill(0)
    .map((_, i) => bytes.slice(i * n, i * n + n))
    .map((a) => (a.length < n ? [...a, ...Array(n - a.length).fill(0xff)] : a));
}

//Hexファイルを読み込み機械語を128バイト毎に区切った2次元配列で返す
//末尾ブロックの余りは0xFFでパディング
export function readHexFileBytesBlocks(filePath: string): number[][] {
  const hexFileRecords = fs
    .readFileSync(filePath, { encoding: 'utf-8' })
    .split(/\r?\n/)
    .filter((a) => !!a)
    .map(createHexRecord);

  const bodyRecords = hexFileRecords.slice(0, hexFileRecords.length - 1);
  const tailRecord = hexFileRecords[hexFileRecords.length - 1];
  if (!checkEndOfFileRecord(tailRecord)) {
    throwInvalidHexFileFormatError();
  }
  if (!checkHexLineRecordsValid(bodyRecords)) {
    throw new Error('The hex file is not compatible with this application.');
  }

  const codeBytes = extractCodeBytesFromHexRecords(bodyRecords);

  const codeBlocks = sliceCodeBytesIntoBlocks(codeBytes, 128);
  return codeBlocks;
}
