#ifndef __USBIO_CORE_H__
#define __USBIO_CORE_H__

#include <stdbool.h>
#include <stdint.h>

//usbioCore
//処理を同期的に行うUSB入出力モジュール
//関数内でエンドポイントのFIFOに直接アクセスする
//RAM上にはバッファを持たない

void usbioCore_initialize();

//HIDキーボードのインタラプトINエンドポイントのFIFOにレポートを書き込む
//引数: 入力, 8バイトの配列へのポインタ
//書き込めた場合はtrue, 書き込めなかった場合はfalseを返す
bool usbioCore_hidKeyboard_writeReport(uint8_t *pReportBytes8);

//GenericHIDのインタラプトINエンドポイントのFIFOにレポートを書き込む
//引数: 入力, 64バイトの配列へのポインタ
//書き込めた場合はtrue, 書き込めなかった場合はfalseを返す
bool usbioCore_genericHid_writeData(uint8_t *pDataBytes64);

//GenericHIDのインタラプトOUTエンドポイントのFIFOからデータを読み出す
//引数: 出力, 64バイトの配列へのポインタ
//FIFOにデータがあり読み出せた場合はtrueを返す
//読み出せなかった場合はfalseを返す
bool usbioCore_genericHid_readDataIfExists(uint8_t *pDataBytes64);

bool usbioCore_isConnectedToHost();

void uibioCore_internal_setSerialNumberText(uint8_t *pTextBuf, uint8_t len);

#endif
