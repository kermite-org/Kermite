#ifndef __EASY_TIMER_H__
#define __EASY_TIMER_H__

#include "types.h"

//指定した処理を一定時間毎に実行するインターバルタイマ
//16bitのタイマ1を使用

void easyTimer_setInterval(void (*timerCallbackProc)(), uint16_t ms);

void easyTimer_setIntervalHz(void (*timerCallbackProc)(), uint16_t hz);

#endif