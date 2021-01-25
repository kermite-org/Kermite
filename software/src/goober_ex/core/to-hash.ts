/**
 * Transforms the input into a className.
 * The multiplication constant 101 is selected to be a prime,
 * as is the initial value of 11.
 * The intermediate and final results are truncated into 32-bit
 * unsigned integers.
 * @param {String} str
 * @returns {String}
 */
export const toHash = (str, label) => {
  const sig0 = str
    .split('')
    .reduce((out, i) => (101 * out + i.charCodeAt(0)) >>> 0, 11);

  const prefix = `go`;
  const sig = parseInt(sig0).toString(36);
  return label ? `${prefix}_${sig}_${label}` : `${prefix}_${sig}`;
};
