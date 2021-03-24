.nolist
#include <avr/io.h>
.list

//WS2812B駆動
//PD4を信号出力ピンとして使用

#define	SET_HIGH sbi _SFR_IO_ADDR(PORTD), 4
#define	SET_LOW cbi _SFR_IO_ADDR(PORTD), 4


.global sum
.func sum
sum:
	add r24, r22
	ret
.endfunc

.global foo0
.func foo0
foo0:
	;0
	SET_HIGH
	nop
	nop
	nop
	nop
	SET_LOW
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
	nop
	nop




	ret
.endfunc

.global foo1
.func foo1
foo1:
	;1
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
	nop
	SET_LOW
	nop
	nop
	nop
	nop
	nop

	ret
.endfunc


.global emitNeoPixelByte
.func emitNeoPixelByte
emitNeoPixelByte:
	ldi r25, 8
	lsl r24
1:
	brcs 2f
	; emit logical 0
	SET_HIGH
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
	;nop
	;nop
	;nop
	;nop
	;nop
	;nop
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
	nop
	SET_LOW
	;nop
	;nop
	;nop
	;nop
	;nop
3:	
	lsl r24
	dec r25
	brne 1b

	ret
.endfunc






//uint8_t sumArrayA(uint8_t *buf, uint8_t len);
.global sumArrayA
.func sumArrayA
sumArrayA:
	//p = buf
	movw r30, r24

	//cnt = len
	mov r20, r22 

	//res = 0
	ldi r24, 0
	
	//loop
1:
	//res += (*p)
	ld r25, Z+
	add r24, r25

	//cnt--
	//break if cnt == 0
	dec r20
	brne 1b
2:

	ret
.endfunc




.macro delay_r25 cnt
	ldi r25, \cnt
0:
	dec r25
	brne 0b
.endm

.macro delay_r23 cnt
	ldi r23, \cnt
0:
	dec r23
	brne 0b
.endm


#define SINGLEWIRE_DEBUG


//---------------------------------------------
//pin control

//signal pin, PD2
#define PORT_Signal _SFR_IO_ADDR(PORTD)
#define DDR_Signal _SFR_IO_ADDR(DDRD)
#define PIN_Signal _SFR_IO_ADDR(PIND)
#define BIT_Signal 2

//debug transactin pin, PE6
#define PORT_Debug1 _SFR_IO_ADDR(PORTE)
#define DDR_Debug1 _SFR_IO_ADDR(DDRE)
#define PIN_Debug1 _SFR_IO_ADDR(PINE)
#define BIT_Debug1 6

//debug secondary pin, PB2
#define PORT_Debug2 _SFR_IO_ADDR(PORTB)
#define DDR_Debug2 _SFR_IO_ADDR(DDRB)
#define PIN_Debug2 _SFR_IO_ADDR(PINB)
#define BIT_Debug2 2


//#define	signalPin_setHigh cbi DDR_Signal, BIT_Signal
//#define	signalPin_setLow sbi DDR_Signal, BIT_Signal


#define	signalPin_setHigh sbi PORT_Signal, BIT_Signal
#define	signalPin_setLow cbi PORT_Signal, BIT_Signal

.macro signalPin_startTransmit
	//hi-z, DDR=0, PORT=0
	; cbi DDR_Signal, BIT_Signal
	; cbi PORT_Signal, BIT_Signal

	//output
	sbi PORT_Signal, BIT_Signal
	sbi DDR_Signal, BIT_Signal
.endm

.macro signalPin_endTransmit_standby
	//hi-z with pullup, DDR=0, PORT=1
	cbi DDR_Signal, BIT_Signal
	sbi PORT_Signal, BIT_Signal
.endm


#ifdef SINGLEWIRE_DEBUG
	#define debug1Pin_init sbi DDR_Debug1, BIT_Debug1
	#define debug1Pin_setHigh sbi PORT_Debug1, BIT_Debug1
	#define debug1Pin_setLow cbi PORT_Debug1, BIT_Debug1

	#define debug2Pin_init sbi DDR_Debug2, BIT_Debug2
	#define debug2Pin_setHigh sbi PORT_Debug2, BIT_Debug2
	#define debug2Pin_setLow cbi PORT_Debug2, BIT_Debug2
	#define debug2Pin_toggle sbi PIN_Debug2, BIT_Debug2
#else
	#define debug1Pin_init nop
	#define debug1Pin_setHigh nop; nop
	#define debug1Pin_setHigh nop; nop

	#define debug2Pin_init nop
	#define debug2Pin_setLow nop; nop
	#define debug2Pin_setLow nop; nop
#endif

//---------------------------------------------


.global initSingleWirePinsC
.func initSingleWirePinsC
initSingleWirePinsC:
	//signal pin, input pullup
	signalPin_endTransmit_standby

	//debug 1 pin, output
	debug1Pin_init

	//debug 2 pin, output
	debug2Pin_init

	ret
.endfunc


.macro outerDelay
	nop
	nop
	nop
	nop
	nop
	nop
	nop
	nop
	; delay_r23 10
.endm

.macro stepDelay
	; nop
	; delay_r23 10
.endm




/*
void emitByteOneC(uint8_t val){
	outSignaLow()
	delay(10)
	
	cnt = 9

	C = 1	//start bit

	while(cnt > 0){
		if(C){
			outSignalHigh()
		}else{
			outSignalLow()
		}
		delay(10)
		C = msb(val), val <<= 1
		cnt--
	}
*/
.global emitByteOneC
.func emitByteOneC
emitByteOneC:

	debug1Pin_setLow
	signalPin_startTransmit
	signalPin_setLow
	debug2Pin_setLow

	//必要
  //bit_off(DDRD, 2);
  //bit_off(PORTD, 2);


	; outDebugPinHigh
	//delay_r23 10

	outerDelay
	signalPin_setHigh	
	debug2Pin_toggle

	outerDelay
	; debug2Pin_toggle

	; outDebugPinLow
	; delay_r23 10

	; OUTPUT_SIGNAL_HIGH

	ldi r20, 8

	; com r24	//C = 1
1:
	lsl r24		//C = msb(r24), r24 << 1

	//case C
	brcs 2f
	//when 0
	signalPin_setLow
2:
	brcc 3f
	//when 1
	signalPin_setHigh
3:
	debug2Pin_toggle
	stepDelay

	; delay_r23 10

	dec r20
	brne 1b

	debug2Pin_toggle

	//debug1Pin_setHigh
	//outDebugPinHigh
	//outSignalPinHigh

	//delay_r23 10


	signalPin_setHigh
	signalPin_setLow
	signalPin_setHigh
	signalPin_setLow
	signalPin_setHigh
	signalPin_setLow

	debug2Pin_setHigh
	debug2Pin_setLow
	debug2Pin_setHigh
	debug2Pin_setLow

	outerDelay

	signalPin_endTransmit_standby

	debug2Pin_setHigh
	debug1Pin_setHigh

	ret
.endfunc