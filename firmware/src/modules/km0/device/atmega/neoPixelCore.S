.nolist
#include <avr/io.h>
#include "config.h"
.list

#define P_B0 0
#define P_B1 1
#define P_B2 2
#define P_B3 3
#define P_B4 4
#define P_B5 5
#define P_B6 6
#define P_B7 7

#define P_C0 8
#define P_C1 9
#define P_C2 10
#define P_C3 11
#define P_C4 12
#define P_C5 13
#define P_C6 14
#define P_C7 15

#define P_D0 16
#define P_D1 17
#define P_D2 18
#define P_D3 19
#define P_D4 20
#define P_D5 21
#define P_D6 22
#define P_D7 23

#define P_E0 24
#define P_E1 25
#define P_E2 26
#define P_E3 27
#define P_E4 28
#define P_E5 29
#define P_E6 30
#define P_E7 31

#define P_F0 32
#define P_F1 33
#define P_F2 34
#define P_F3 35
#define P_F4 36
#define P_F5 37
#define P_F6 38
#define P_F7 39


#define portIndex(p) ((p) >> 3)
#define portBit(p) ((p) & 0x07)

#define regPINX(p) _SFR_IO8(0x03 + 3 * portIndex(p))
#define regDDRX(p) _SFR_IO8(0x04 + 3 * portIndex(p))
#define regPORTX(p) _SFR_IO8(0x05 + 3 * portIndex(p))


#ifndef KM0_ATMEGA_NEOPIXELCORE__PIN_RGBLED
#error KM0_ATMEGA_NEOPIXELCORE__PIN_RGBLED is not defined
#endif

#define PIN_RGBLED KM0_ATMEGA_NEOPIXELCORE__PIN_RGBLED

#define SET_PORT_OUTPUT sbi _SFR_IO_ADDR(regDDRX(PIN_RGBLED)), portBit(PIN_RGBLED)
#define	SET_HIGH sbi _SFR_IO_ADDR(regPORTX(PIN_RGBLED)), portBit(PIN_RGBLED)
#define SET_LOW cbi _SFR_IO_ADDR(regPORTX(PIN_RGBLED)), portBit(PIN_RGBLED)


.global neoPixelCore_initialize
.func neoPixelCore_initialize
neoPixelCore_initialize:
	SET_PORT_OUTPUT
	SET_LOW
	ret
.endfunc

.global neoPixelCore_emitByte
.func neoPixelCore_emitByte
neoPixelCore_emitByte:
	ldi r25, 8
	lsl r24
1:
	brcs 2f
	; emit logical 0
	SET_HIGH
	nop
	nop
	nop
	;nop
	SET_LOW
	nop
	;nop
2:
	brcc 3f
	; emit logical 1
	SET_HIGH
	nop
	nop
	nop
	nop
	nop
	nop
	nop
	nop
	nop
	nop
	;nop
	SET_LOW
	nop
	nop
	nop
	nop
	nop
3:	
	lsl r24
	dec r25
	brne 1b
	ret
.endfunc

