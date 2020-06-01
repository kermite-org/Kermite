.nolist
#include <avr/io.h>
.list

//---------------------------------------------
//configurations

//追加のピンにタイミングデバッグ用の信号を出力する
//#define SINGLEWIRE_DEBUG

//High/LowではなくHi-ZとLowでピンを駆動する
//#define SINGLEWIRE_SIMULATE_OPEN_DRAIN

//信号ピン
#define SW_PIN_PD0
//#define SW_PIN_PD2


//信号ピン(PD0 or PD2)
//signal pin, PD0 or PD2
#define PORT_Signal _SFR_IO_ADDR(PORTD)
#define DDR_Signal _SFR_IO_ADDR(DDRD)
#define PIN_Signal _SFR_IO_ADDR(PIND)
#ifdef SW_PIN_PD0
	#define BIT_Signal 0
#endif
#ifdef SW_PIN_PD2
	#define BIT_Signal 2
#endif


//デバッグ用ピン(任意のピンを指定可)
//debug transactin pin
#define PORT_Debug1 _SFR_IO_ADDR(PORTF)
#define DDR_Debug1 _SFR_IO_ADDR(DDRF)
#define PIN_Debug1 _SFR_IO_ADDR(PINF)
#define BIT_Debug1 4

//デバッグ用ピン(任意のピンを指定可)
//debug secondary pin
#define PORT_Debug2 _SFR_IO_ADDR(PORTF)
#define DDR_Debug2 _SFR_IO_ADDR(DDRF)
#define PIN_Debug2 _SFR_IO_ADDR(PINF)
#define BIT_Debug2 5

//---------------------------------------------
//module local variables

.section .data

receiveBuffer: .dc.w 0
receiveBufferCapacity: .dc.b 0
receivedCount: .dc.b 0

.section .text

//---------------------------------------------
//utilities

.macro push_registers from, to
	push \from
	.if \to-\from
		push_registers "(\from+1)",\to
	.endif
.endm

.macro pop_registers from, to
	pop \to
	.if \to-\from
		pop_registers \from,"(\to-1)"
	.endif
.endm


.macro delayCount cnt:req, reg1=r25
	ldi \reg1, \cnt
0:
	dec \reg1
	brne 0b
.endm

.macro nopn cnt:req
	nop
	.if \cnt
		nopn (\cnt-1),
	.endif
.endm

//---------------------------------------------
//pin control

#ifdef SINGLEWIRE_SIMULATE_OPEN_DRAIN
	#define	signalPin_setHigh cbi DDR_Signal, BIT_Signal
	#define	signalPin_setLow sbi DDR_Signal, BIT_Signal

	.macro signalPin_startTransmit
		//hi-z, DDR=0, PORT=0
		cbi DDR_Signal, BIT_Signal
		cbi PORT_Signal, BIT_Signal
	.endm

	.macro signalPin_endTransmit_standby
		//input with pullup, DDR=0, PORT=1
		cbi DDR_Signal, BIT_Signal
		sbi PORT_Signal, BIT_Signal
	.endm

#else
	#define	signalPin_setHigh sbi PORT_Signal, BIT_Signal
	#define	signalPin_setLow cbi PORT_Signal, BIT_Signal

	.macro signalPin_startTransmit
		//output
		sbi PORT_Signal, BIT_Signal
		sbi DDR_Signal, BIT_Signal
	.endm


	.macro signalPin_endTransmit_standby
		//input with pullup, DDR=0, PORT=1
		cbi DDR_Signal, BIT_Signal
		sbi PORT_Signal, BIT_Signal
	.endm
#endif


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
	#define debug1Pin_setLow nopn 2
	#define debug1Pin_setHigh nopn 2

	#define debug2Pin_init nop
	#define debug2Pin_setLow nopn 2
	#define debug2Pin_setHigh nopn 2
#endif


/*
void configureSingleWirePins(){
	signalPin_endTransmit_standby()
	debug1Pin_init()
	debug2Pin_init()
}
*/
.func configureSingleWirePins
configureSingleWirePins:
	//signal pin, input pullup
	signalPin_endTransmit_standby

	//debug 1 pin, output
	debug1Pin_init

	//debug 2 pin, output
	debug2Pin_init
	ret
.endfunc

//---------------------------------------------

#ifdef SW_PIN_PD0
	#define clearInterruptTriggerFlags sbi _SFR_IO_ADDR(EIFR), INTF0
#endif

#ifdef SW_PIN_PD2
	#define clearInterruptTriggerFlags sbi _SFR_IO_ADDR(EIFR), INTF2
#endif


#define LOW_DUR_CNT 7

.macro emitLogicalZero
	signalPin_setHigh
	nopn 5
	signalPin_setLow
	delayCount LOW_DUR_CNT, r19
.endm


.macro emitLogicalOne
	signalPin_setHigh
	nopn 21
	signalPin_setLow
	delayCount LOW_DUR_CNT, r19
.endm


/*
void emitByteOne(uint8_t val){
	cnt = 8
	while(cnt > 0){
		C = msb(val), val <<= 1
		if(!C){
			emitLogicalZero()
		}else{
			emitLogicalOne()
		}
		cnt--
	}
}
*/
.func emitByteOne
emitByteOne:
	//cnt = 8
	ldi r20, 8

	//loop
1:
	//C = msb(r24), r24 << 1
	lsl r24
	//case C
	brcs 2f
	//when C == 0
	emitLogicalZero
2:
	brcc 3f
	//when C == 1
	emitLogicalOne
3:
	//nopn 10

	//cnt--
	//break if cnt == 0
	dec r20
	brne 1b

	ret
.endfunc


/*
void emitBytesN(uint8_t *buf, uint8_t len){
	signalPin_startTransmit()
	signalPin_setLow()
	delay(80)
	p = buf
	p_end = buf + len
	while(1){
		delay(10)
		emitByteOne(*p++)
		if(p == p_end){
			break
		}
		emitLogicalZero()	//継続ビット, 0
	}
	emitLogicalOne()	//終端ビット, 1
	delay(20)
	signalPin_endTransmit_standby()
}
*/
.func emitBytesN
emitBytesN:
	cli
	//debug1Pin_setLow
	signalPin_startTransmit
	signalPin_setLow

	//p = buf
	movw r30, r24

	//p_end = buf + len
	movw r18, r24
	add r18, r22
	

	delayCount 80

	//loop through bytes
1:
	delayCount 10

	//emitByteOne *p++
	ld r24, Z+
	call emitByteOne

	//break if p == p_end
	cp r30, r18
	brcc 3f

	; delayCount 5

	emitLogicalZero

	//loop next
	rjmp 1b
3:
	delayCount 3
	emitLogicalOne
	delayCount 20

	signalPin_endTransmit_standby
	//debug1Pin_setHigh
	//delayCount 20
	
	clearInterruptTriggerFlags
	sei
	ret
.endfunc




/*
[uint8_t, uint8t] receiveBitOne(){
	while(is_low(PIN_SIGNAL)){}
	w = 0
	while(is_Hieh(PIN_SIGNAL)){
		if(w > 60){
			goto :abort
		}
		w++
	}
	if(w >= 4){
		return [1, 0]
	}else{
		return [0, 0]
	}
abort:
	return [ , 1]
}
*/
.func receiveBitOne
receiveBitOne:
	; ldi r25, 0	//error=0
10:
	//lowの間ループ, データパルス待ち
	sbis PIN_Signal, BIT_Signal	//highでbreak
	rjmp 10b
	
	debug2Pin_setHigh

	//w = 0
	ldi r24, 0	//HIのパルス幅を測るカウンタ
20:
	//highの間ループしてパルス幅を測る
	//w++
	inc r24
	
	cpi r24, 60
	breq 40f		//タイムアウト, 無限ループ防止

	sbic PIN_Signal, BIT_Signal	//lowでbreak
	rjmp 20b

	debug2Pin_setLow

	//パルス幅カウントから論理値を求める
	//r24にパルス幅のカウントが格納されている
	//r24 <= 3 (typical 1 or 2) ... 論理0
	//r24 >= 4 (typical 6) ... 論理1
	cpi r24, 4
	brcs 30f	//r24 < 4なら分岐

	//return logical 1
	ldi r24, 1
	ldi r25, 0	//no error
	ret
30:
	//return logical 0
	ldi r24, 0
	ldi r25, 0	//no error
	ret
40:
	//return timeout error
	ldi r25, 1
	ret
.endfunc



//1バイト受信処理
/*
[uint8_t, uint8_t] receiveByteOne(){
	cnt = 8
	data = 0
	while(cnt > 0){
		[val, err] = receiveBitOne
		if(err){
			goto abort
		}
		data <<= 1
		if(val){
			data |= 1
		}
		cnt--
	}
	return [data, 0]
abort:
	return [, 1]
}
*/
.func receiveByteOne
receiveByteOne:
	//cbi REGBIT_PORT_RECEIVE_DEBUG	//デバッグ信号出力

	//cnt = 8
	ldi r23, 8	//8回ループして8ビット分のパルスを受け取る

	//data = 0
	ldi r22, 0 	//1バイトの受信データを格納するレジスタ

10:

	call receiveBitOne

	; sbrs r25, 1
	//r25==1ならtimeout, abort
	cpi r25, 0
	brne 40f	//abort

	//データのビットに反映
	lsl r22		//受信データバイトを左にシフト
	sbrc r24, 0		//r24==0なら次をスキップ
	ori r22, 0x01		//受信データのビットをセット

	//次のビットの受信に進む
	//or 8ビット受信したら終了
	dec r23
	brne 10b

	mov r24, r22		//result byte
	ldi r25, 0	//success
	ret

40:
	ldi r25, 1	//failure
	ret
.endfunc




/*
uint8_t receiveBytesN(){
	buf = receiveBuffer
	maxlen = receiveBufferCapacity

	p = buf
	p_end = buf + maxlen
	cnt = 0
	while(p < p_end){
		//1バイト受信
		[val, err] = receiveByteOne()
		if(err){
			goto abort
		}
		*p = val
		cnt++

		//継続/終端判定ビットを受信
		[val, err] = receiveBitOne()
		if(err){
			goto abort
		}
		if(val){
			break
		}
	}
	receivedCount = cnt
	delay(20)
abort:
	receivedCount = 0
	delay(50)
}
*/
.func receiveBytesN
receiveBytesN:

	lds r24, receiveBuffer
	lds r25, receiveBuffer+1
	lds r22, receiveBufferCapacity

	debug1Pin_setLow
	debug2Pin_setLow

	//p = buf
	movw r30, r24

	//p_end = buf + len
	movw r18, r24
	add r18, r22

	//cnt = 0
	ldi r20, 0
	
	//loop
1:
	//break if p == p_end
	cp r30, r18
	brcc 3f

	//*p = receiveByteOne
	call receiveByteOne
	cpi r25, 0
	brne 40f		//timeout detected, abort

	st Z+, r24
	inc r20

	//break if receiveBitOne()
	call receiveBitOne
	cpi r25, 0
	brne 40f		//timeout detected, abort

	cpi r24, 0
	breq 1b

3:
	sts receivedCount, r20
	delayCount 20
	debug2Pin_setHigh
	debug1Pin_setHigh
	ret

40:
	sts receivedCount, r1
	delayCount 50
	debug2Pin_setHigh
	debug1Pin_setHigh
	ret
.endfunc










.func receiveBytesN_debugMeasureHeadPulseWidth
receiveBytesN_debugMeasureHeadPulseWidth:

	lds r24, receiveBuffer
	lds r25, receiveBuffer+1
	lds r22, receiveBufferCapacity

	movw r30, r24

	debug1Pin_setLow
	debug2Pin_setLow

	//先頭ビットのパルス幅を測る
10:
	//lowの間ループ, データパルス待ち
	sbis PIN_Signal, BIT_Signal	//highでbreak
	rjmp 10b
	
	debug2Pin_setHigh

	ldi r24, 0	//HIのパルス幅を測るカウンタ
20:
	//highの間ループしてパルス幅を測る
	inc r24
	
	//cpi r24, 20
	//breq 40f		//タイムアウト, 無限ループ防止

	sbic PIN_Signal, BIT_Signal	//lowでbreak
	rjmp 20b

	debug2Pin_setLow
	st Z+, r24

	ldi r24, 1
	sts receivedCount, r24

	//後続8ビットを受信して捨てる
	ldi r25, 8
30:
	call receiveBitOne
	dec r25
	brne 30b

	delayCount 20
	; sts receivedCount, r20
	debug2Pin_setHigh
	debug1Pin_setHigh
	ret

.endfunc






//---------------------------------------------
//receive pin interrupt

.func configureSingalReceivePinChangeInterruption
configureSingalReceivePinChangeInterruption:

#ifdef SW_PIN_PD0
  //INT0(PD0)ピンがHIGHからLOWに変化したときに割り込みを生成
	ldi r24, 0b00000010
	sts EICRA, r24
	sbi _SFR_IO_ADDR(EIMSK), INT0
#endif

#ifdef SW_PIN_PD2
  //INT2(PD2)ピンがHIGHからLOWに変化したときに割り込みを生成
	ldi r24, 0b00100000
	sts EICRA, r24
	sbi _SFR_IO_ADDR(EIMSK), INT2
#endif

	ret
.endfunc

/*
ISR(INT2_vect) {
  receiveBytesN()
  clearInterruptTriggerFlags()
}
*/
#ifdef SW_PIN_PD0
.global INT0_vect
.func INT0_vect
INT0_vect:
#endif
#ifdef SW_PIN_PD2
.global INT2_vect
.func INT2_vect
INT2_vect:
#endif
	push r0
	push r1
	in r0, _SFR_IO_ADDR(SREG)
	push r0
	push_registers 18, 31
	clr r1
	
	call receiveBytesN
	//call receiveBytesN_debugMeasureHeadPulseWidth
	clearInterruptTriggerFlags

	pop_registers 18, 31
	pop r0
	out _SFR_IO_ADDR(SREG), r0
	pop r1
	pop r0
	reti
.endfunc


//---------------------------------------------
//exports

.global singleWire_initialize_txonly
.func singleWire_initialize_txonly
singleWire_initialize_txonly:
	call configureSingleWirePins
	//call configureSingalReceivePinChangeInterruption
	ret
.endfunc


/*
void singleWire_initialize(){
	configureSingleWirePins()
	configureSingalReceivePinChangeInterruption()
}
*/
.global singleWire_initialize
.func singleWire_initialize
singleWire_initialize:
	call configureSingleWirePins
	call configureSingalReceivePinChangeInterruption
	ret
.endfunc

/*
void singleWire_registerReceiveBuffer(uint8_t *buffer, uint8_t capacity) {
  receiveBuffer = buffer
  receiveBufferLength = len
}
*/
.global singleWire_registerReceiveBuffer
.func singleWire_registerReceiveBuffer
singleWire_registerReceiveBuffer:
	sts receiveBuffer, r24
	sts receiveBuffer+1, r25
	sts receiveBufferCapacity, r22
	ret
.endfunc

/*
void singleWire_sendBytes(uint8_t *bytes, uint8_t len){
	emitBytesN(bytes, len)
}
*/
.global singleWire_sendBytes
.func singleWire_sendBytes
singleWire_sendBytes:
	call emitBytesN
	ret
.endfunc

/*
uint8_t singleWire_peekReceivedCount() {
  res = receivedCount
  receivedCount = 0
  return res
}
*/
.global singleWire_peekReceivedCount
.func singleWire_peekReceivedCount
singleWire_peekReceivedCount:
	lds r24, receivedCount
	sts receivedCount, r1
	ret
.endfunc







