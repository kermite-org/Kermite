export function bytesToHexString(bytes: number[]) {
  return bytes.map((b) => ('00' + b.toString(16)).slice(-2)).join(' ');
}

export function bhi(word: number) {
  return (word >> 8) & 0xff;
}

export function blo(word: number) {
  return word & 0xff;
}
