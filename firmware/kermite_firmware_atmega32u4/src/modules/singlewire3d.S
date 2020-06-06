.nolist
#include <avr/io.h>
.list

//単線通信
//パルス幅で0/1を表す
//singlewire2, singlewire3cをベースに調整
//240kbps

//---------------------------------------------
//module local variables

.section .data

//void (*pReceiverCallback)() = null
pReceiverCallback: .dc.w 0

.section .bss

//uint8_t signlewire3_debugValues[4]
.global singlewire3_debugValues
singlewire3_debugValues: .ds.b	4


//---------------------------------------------

.section .text

//---------------------------------------------
//configurations

//信号ピン設定
//以下のいずれかをビルド時のフラグで注入して指定
//SINGLEWIRE_SIGNAL_PIN_PD0
//SINGLEWIRE_SIGNAL_PIN_PD2

#ifdef SINGLEWIRE_SIGNAL_PIN_PD0
	#define SW_PIN_PD0
#endif

#ifdef SINGLEWIRE_SIGNAL_PIN_PD2
	#define SW_PIN_PD2
#endif


#define dDDR _SFR_IO_ADDR(DDRD)
#define dPORT _SFR_IO_ADDR(PORTD)
#define dPIN _SFR_IO_ADDR(PIND)

#if defined(SW_PIN_PD0)
  #define dBit 0
  #define dBitMask 0x01
  #define dISCx0 ISC00
  #define dINTx INT0
  #define dINTFx INTF0
	#define dIsrRegConf_EICRA 0b00000010
  #define dINTx_vect INT0_vect
#elif defined(SW_PIN_PD2)
  #define dBit 2
  #define dBitMask 0x04
  #define dISCx0 ISC20
  #define dINTx INT2
  #define dINTFx INTF2
	#define dIsrRegConf_EICRA 0b00100000
  #define dINTx_vect INT2_vect
#else
  #error Singlewire pin configuration option SINGLEWIRE_SIGNAL_PIN_PDx is not provided.
#endif

#define clearInterruptTriggerFlags sbi _SFR_IO_ADDR(EIFR), dINTFx

//---------------------------------------------
//signal pin control

.macro signalPin_startTransmit
  //output high, DDR=1, PORT=1
  sbi dDDR, dBit
  sbi dPORT, dBit
.endm


.macro signalPin_endTransmit_standby
  //input with pullup, DDR=0, PORT=1
  cbi dDDR, dBit
  sbi dPORT, dBit
.endm

.macro signalPin_setHigh
  sbi dPORT, dBit
.endm

.macro signalPin_setLow
  cbi dPORT, dBit
.endm


//---------------------------------------------
//timing debug pin


#ifdef SINGLEWIRE_ENABLE_TIMING_DEBUG_PINS
  #define pinDebug_PORT _SFR_IO_ADDR(PORTF)
  #define pinDebug_DDR _SFR_IO_ADDR(DDRF)
  #define pinDebug_PIN _SFR_IO_ADDR(PINF)
  #define pinDebug_Bit 4

	#define debug_initTimeDebugPin sbi pinDebug_DDR, pinDebug_Bit
	#define debug_timingPinHigh sbi pinDebug_PORT, pinDebug_Bit
	#define debug_timingPinLow cbi pinDebug_PORT, pinDebug_Bit
#else
	#define debug_initTimeDebugPin nop
	#define debug_timingPinHigh nopn 2
	#define debug_timingPinLow nopn 2
#endif



//---------------------------------------------
//utilities

.macro pushRegisters from, to
	push \from
	.if \to-\from
		pushRegisters "(\from+1)",\to
	.endif
.endm

.macro popRegisters from, to
	pop \to
	.if \to-\from
		popRegisters \from,"(\to-1)"
	.endif
.endm

.macro nopn cnt:req
	nop
	.if \cnt-1
		nopn (\cnt-1),
	.endif
.endm

.macro delayCount cnt:req, reg1=r25
	ldi \reg1, \cnt
0:
	dec \reg1
	brne 0b
.endm

//---------------------------------------------

#define CntLowDuration 7

.macro emitLogicalZero
	signalPin_setHigh
	nopn 5
	signalPin_setLow
	delayCount CntLowDuration, r19
.endm

.macro emitLogicalOne
	signalPin_setHigh
	nopn 23
	signalPin_setLow
	delayCount CntLowDuration, r19
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
	//cnt--
	//break if cnt == 0
	dec r20
	brne 1b

	ret
.endfunc





/*
void singlewire_sendFrame(uint8_t *buf, uint8_t len){
	signalPin_startTransmit()
	signalPin_setLow()
	delay(40)
	p = buf
	p_end = buf + len
	while(1){
		emitSingleByte(*p++)
		if(p == p_end){
			break
		}
		emitLogicalZero()	//継続ビット, 0
	}
	emitLogicalOne()	//終端ビット, 1
	delay(10)
	signalPin_endTransmit_standby()
  clearInterruptTriggerFlags()
}
*/
.global singlewire_sendFrame
.func singlewire_sendFrame
singlewire_sendFrame:
	
	signalPin_startTransmit
	signalPin_setLow

	//p = buf
	movw r30, r24

	//p_end = buf + len
	movw r18, r24
	add r18, r22

	delayCount 40

	//loop through bytes
1:

	//emitByteOne *p++
	ld r24, Z+
	call emitByteOne

	//break if p == p_end
	cp r30, r18
	brcc 3f

	emitLogicalZero

	//loop next
	rjmp 1b

3:
	emitLogicalOne
	delayCount 10
	signalPin_endTransmit_standby
	clearInterruptTriggerFlags
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
	sbis dPIN, dBit	//highでbreak
	rjmp 10b
	
	debug_timingPinHigh

	//w = 0
	ldi r24, 0	//HIのパルス幅を測るカウンタ
20:
	//highの間ループしてパルス幅を測る
	//w++
	inc r24
	
	cpi r24, 60
	breq 40f		//タイムアウト, 無限ループ防止

	sbic dPIN, dBit	//lowでbreak
	rjmp 20b

	debug_timingPinLow

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
void skipLow(){
	while(is_low(PIN_SIGNAL)){}
}
*/
.func skipLow
skipLow:
10:
	//lowの間ループ, データパルス待ち
	sbis dPIN, dBit	//highでbreak
	rjmp 10b
	ret
.endfunc


/*
void waitWhileHigh(){
	w = 0
	while(is_Hieh(PIN_SIGNAL)){
		if(w > 200){
			goto :abort
		}
		w++
	}
}
*/
.func waitWhileHigh
waitWhileHigh:
	ldi r23, 0
20:
	inc r23
	cpi r23, 200
	breq 40f		//タイムアウト, 無限ループ防止
	sbic dPIN, dBit	//lowでbreak
	rjmp 20b
40:
	ret
.endfunc





/*
uint8_t singlewire_receiveFrame(uint8_t* buf, uint8_t maxlen){
	p = buf
	p_end = buf + maxlen
	cnt = 0
	waitWhileHigh()
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
	delay(20)
  return cnt
abort:
	delay(50)
  return 0
}
*/
.global singlewire_receiveFrame
.func singlewire_receiveFrame
singlewire_receiveFrame:
	//p = buf
	movw r30, r24

	//p_end = buf + len
	movw r18, r24
	add r18, r22

	//cnt = 0
	ldi r20, 0
	
	//相手がまだ送信を開始していない場合、送信開始を待つ
	call waitWhileHigh
	
	debug_timingPinLow

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
	call skipLow
	debug_timingPinHigh
	clearInterruptTriggerFlags
	mov r24, r20
	ret

//abort:
40:
	delayCount 20
	clearInterruptTriggerFlags
  ldi r24, 0
	ret
.endfunc

/*
void singlewire_initialize(){
	signalPin_endTransmit_standby()
	debug_initTimeDebugPin()
}
*/
.global singlewire_initialize
.func singlewire_initialize
singlewire_initialize:
	//signal pin, input pullup
	signalPin_endTransmit_standby

	//timing debug pin, output
	debug_initTimeDebugPin

	ret
.endfunc


//---------------------------------------------
//receive pin interrupt

.global singlewire_setupInterruptedReceiver
.func singlewire_setupInterruptedReceiver
singlewire_setupInterruptedReceiver:
  sts pReceiverCallback, r24
  sts pReceiverCallback+1, r25

  //INT0(PD0)ピンがHIGHからLOWに変化したときに割り込みを生成
	ldi r24, dIsrRegConf_EICRA
	sts EICRA, r24
	sbi _SFR_IO_ADDR(EIMSK), dINTx

	ret
.endfunc

/*
ISR(dINTx_vect) {
  if (pReceiverCallback) {
    pReceiverCallback()
  }
}
*/
.global dINTx_vect
.func dINTx_vect
dINTx_vect:
	push r0
	push r1
	in r0, _SFR_IO_ADDR(SREG)
	push r0
	pushRegisters 18, 31
	clr r1	

  lds r30, pReceiverCallback
  lds r31, pReceiverCallback+1

  sbiw r30, 0x00
  breq .+2
  icall

	clearInterruptTriggerFlags

	popRegisters 18, 31
	pop r0
	out _SFR_IO_ADDR(SREG), r0
	pop r1
	pop r0
	reti
.endfunc

