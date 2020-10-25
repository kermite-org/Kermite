#include "easyTimer.h"

#include "bitOperations.h"
#include <avr/interrupt.h>
#include <avr/io.h>

#include "stdio.h"

//todo: デバッグする

static void (*local_timerCallbackProc)() = 0;

static void setupTimer1ForCompareMatchInterruption(uint32_t topCount) {
  uint32_t topCount0 = topCount;
  uint8_t div = 1;
  while (topCount > 0xFFFF) {
    if (div == 1 || div == 2) {
      topCount >>= 3;
      div++;
    } else if (div == 3 || div == 4) {
      topCount >>= 2;
      div++;
    } else {
      //タイマセットアップ不可
      printf("cannot setup, %d, %d, %d\n", topCount0, topCount, div);
      return;
    }
  }
  printf("%d, %d, %d\n", (int)topCount0, (int)topCount, (int)div);

  //CTC動作
  bits_spec(TCCR1A, WGM10, 0b11, 0b00);
  bits_spec(TCCR1B, WGM12, 0b11, 0b01);
  //分周設定
  bits_spec(TCCR1B, CS10, 0b111, div);
  OCR1A = topCount;
  TCNT1 = 0;
  bit_on(TIMSK1, OCIE1A);
  sei();
}

void easyTimer_setInterval(void (*timerCallbackProc)(), uint16_t ms) {
  if (!(1 <= ms && ms < 4000)) {
    //4000ms以上は不可
    return;
  }
  local_timerCallbackProc = timerCallbackProc;

  uint32_t topCount = F_CPU / 1000 * ms;
  setupTimer1ForCompareMatchInterruption(topCount);
}

void easyTimer_setIntervalHz(void (*timerCallbackProc)(), uint16_t hz) {
  if (hz == 0) {
    return;
  }
  local_timerCallbackProc = timerCallbackProc;
  uint32_t topCount = F_CPU / hz;
  setupTimer1ForCompareMatchInterruption(topCount);
}

ISR(TIMER1_COMPA_vect) {
  if (local_timerCallbackProc) {
    local_timerCallbackProc();
  }
}