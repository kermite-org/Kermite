export function zeros(n: number): number[] {
  return Array(n).fill(0);
}

export function calcChecksum(data: number[]) {
  let ck = 0;
  data.forEach((d) => (ck = ck ^ d));
  return ck;
}

export function splitUint16LE(val: number) {
  return [val & 0xff, (val >> 8) & 0xff];
}

export function writeUint8(buf: number[], pos: number, val: number) {
  buf[pos] = val;
}

export function writeUint16LE(buf: number[], pos: number, val: number) {
  const ar = splitUint16LE(val);
  buf[pos] = ar[0];
  buf[pos + 1] = ar[1];
}

export function writeUint16BE(buf: number[], pos: number, val: number) {
  buf[pos] = (val >> 8) & 0xff;
  buf[pos + 1] = val & 0xff;
}

export function bhi(val: number) {
  return (val >> 8) & 0xff;
}

export function blo(val: number) {
  return val & 0xff;
}
