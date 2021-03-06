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
