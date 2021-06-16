.nolist
#include "asmGpioDefs.h"
#include "config.h"
.list

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

