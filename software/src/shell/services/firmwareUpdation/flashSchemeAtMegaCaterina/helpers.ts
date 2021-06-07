export function bytesToHexString(bytes: number[]) {
  return bytes.map((b) => ('00' + b.toString(16)).slice(-2)).join(' ');
}

export function bytesToHexStringWithOmit(bytes: number[], maxLen: number) {
  if (bytes.length > maxLen) {
    const core = bytes.slice(0, maxLen);
    return bytesToHexString(core) + ` ... (${bytes.length}bytes)`;
  } else {
    return bytesToHexString(bytes);
  }
}

export function bhi(word: number) {
  return (word >> 8) & 0xff;
}

export function blo(word: number) {
  return word & 0xff;
}

export function hex4(value: number) {
  return ('0000' + value.toString(16).toUpperCase()).slice(-4);
}

export function bufferPadZerosTo(bytes: number[], len: number) {
  const padding = new Array(len - bytes.length).fill(0);
  return [...bytes, ...padding];
}

export function splitBytesN(bytes: number[], n: number) {
  const m = Math.ceil(bytes.length / n);
  return Array(m)
    .fill(0)
    .map((_, i) => bytes.slice(i * n, i * n + n));
}
