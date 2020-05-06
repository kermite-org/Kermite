#ifndef __HID_KEYBOARD_REPORT_MANAGER_H__
#define __HID_KEYBOARD_REPORT_MANAGER_H__

#include "types.h"

//hidKey --> update internal report buffer
//内部で管理しているHIDキーボードレポートを更新
//8バイトで構成されるHIDキーボードレポートのポインタを返す
uint8_t *hidKeyCombinationManager_updateReport(uint16_t hidKey, bool isDown);

#endif
