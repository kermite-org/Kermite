#ifndef __BIT_OPERATIONS_H__
#define __BIT_OPERATIONS_H__

#define bit_on(p, b) ((p) |= (1 << (b)))
#define bit_off(p, b) ((p) &= ~(1 << (b)))
#define bit_spec(p, b, s) ((s) ? (bit_on((p), (b))) : (bit_off((p), (b))))
#define bits_spec(p, pos, mask, data) ((p) = ((p) & ~((mask) << (pos))) | ((data) << (pos)))
#define bit_invert(p, b) ((p) ^= (1 << (b)))

#define bit_read(p, b) (((p) & (1 << (b))) > 0)
#define bits_read(p, pos, mask) (((p) >> (pos)) & (mask))
#define bit_is_on(p, b) (bit_read((p), (b)))
#define bit_is_off(p, b) (!(bit_read((p), (b))))

inline void writeArrayedBitFlagsBit(uint8_t *bitFlagBytes, uint8_t flagIndex, bool state) {
  uint8_t byteIndex = flagIndex >> 3;
  uint8_t bitIndex = flagIndex & 7;
  bit_spec(bitFlagBytes[byteIndex], bitIndex, state);
}

#endif