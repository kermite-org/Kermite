export function zeros(n: number): number[] {
  return Array(n).fill(0);
}

export function iota(n: number): number[] {
  return Array(n)
    .fill(0)
    .map((_, idx) => idx);
}

export function padZeros(buf: number[], n: number) {
  if (buf.length > n) {
    throw new Error(`buffer length too large ${buf.length} / ${n}`);
  }
  if (buf.length === n) {
    return buf;
  } else {
    return [...buf, ...zeros(n - buf.length)];
  }
}

export function calcChecksum(data: number[]) {
  let ck = 0;
  data.forEach(d => (ck = ck ^ d));
  return ck;
}

export function splitShortValueLE(val: number) {
  return [val & 0xff, (val >> 8) & 0xff];
}

export function writeUint8(buf: number[], pos: number, val: number) {
  buf[pos] = val;
}

export function writeUint16LE(buf: number[], pos: number, val: number) {
  const ar = splitShortValueLE(val);
  buf[pos] = ar[0];
  buf[pos + 1] = ar[1];
}

export function bhi(val: number) {
  return (val >> 8) & 0xff;
}

export function blo(val: number) {
  return val & 0xff;
}

export function getArrayFromBuffer(data: any) {
  return new Uint8Array(Buffer.from(data));
}

export function delayMs(n: number) {
  return new Promise(resolve => setTimeout(resolve, n));
}
