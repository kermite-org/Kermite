// This code is based on the the part of teensy core libraries.

/* USB Keyboard Example for Teensy USB Development Board
 * http://www.pjrc.com/teensy/usb_keyboard.html
 * Copyright (c) 2009 PJRC.COM, LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

#include "km0/deviceIo/usbIoCore.h"
#include "config.h"
#include "km0/common/bitOperations.h"
#include "km0/common/utils.h"
#include <avr/interrupt.h>
#include <avr/io.h>
#include <avr/pgmspace.h>
#include <stdio.h>
#include <util/delay.h>

//#define USBIOCORE_DEBUG

#ifdef USBIOCORE_DEBUG
#define dprintf printf
#else
void dprintf() {
}
#endif

#ifndef KM0_USB_VENDOR_ID
#define KM0_USB_VENDOR_ID 0xF055
#endif

#ifndef KM0_USB_PRODUCT_ID
#define KM0_USB_PRODUCT_ID 0xA577
#endif

#ifndef KM0_USB_MANUFACTURER_TEXT
#define KM0_USB_MANUFACTURER_TEXT L"Kermite"
#endif

#ifndef KM0_USB_PRODUCT_TEXT
#define KM0_USB_PRODUCT_TEXT L"Kermite Keyboard Device"
#endif

// #define KEYBOARD_ENDPOINT 3

// #define RAWHID_TX_ENDPOINT 1
// #define RAWHID_RX_ENDPOINT 2

#define CPU_PRESCALE(n) (CLKPR = 0x80, CLKPR = (n))

#define EP_TYPE_CONTROL 0x00
#define EP_TYPE_INTERRUPT_IN 0xC1
#define EP_TYPE_INTERRUPT_OUT 0xC0

// #define EP_TYPE_BULK_IN 0x81
// #define EP_TYPE_BULK_OUT 0x80

// #define EP_TYPE_ISOCHRONOUS_IN 0x41
// #define EP_TYPE_ISOCHRONOUS_OUT 0x40

#define EP_SINGLE_BUFFER 0x02
#define EP_DOUBLE_BUFFER 0x06

#define EP_SIZE(s) ((s) == 64 ? 0x30 : ((s) == 32 ? 0x20 : ((s) == 16 ? 0x10 : 0x00)))

//#define MAX_ENDPOINT 4

#define LSB(n) (n & 255)
#define MSB(n) ((n >> 8) & 255)

// standard control endpoint request types
#define GET_STATUS 0
#define CLEAR_FEATURE 1
#define SET_FEATURE 3
#define SET_ADDRESS 5
#define GET_DESCRIPTOR 6
#define GET_CONFIGURATION 8
#define SET_CONFIGURATION 9
#define GET_INTERFACE 10
#define SET_INTERFACE 11
// HID (human interface device)
#define HID_GET_REPORT 1
#define HID_GET_IDLE 2
#define HID_GET_PROTOCOL 3
#define HID_SET_REPORT 9
#define HID_SET_IDLE 10
#define HID_SET_PROTOCOL 11

// CDC (communication class device)
// #define CDC_SET_LINE_CODING 0x20
// #define CDC_GET_LINE_CODING 0x21
// #define CDC_SET_CONTROL_LINE_STATE 0x22
//#endif

// #include "avr/io.h"
// #include <avr/interrupt.h>
// #include <avr/pgmspace.h>
// #include <util/delay.h>

/**************************************************************************
 *
 *  Configurable Options
 *
 **************************************************************************/

// Mac OS-X and Linux automatically load the correct drivers.  On
// Windows, even though the driver is supplied by Microsoft, an
// INF file is needed to load the driver.  These numbers need to
// match the INF file.
#define VENDOR_ID KM0_USB_VENDOR_ID
#define PRODUCT_ID KM0_USB_PRODUCT_ID

// You can change these to give your code its own name.
#define STR_MANUFACTURER KM0_USB_MANUFACTURER_TEXT
#define STR_PRODUCT KM0_USB_PRODUCT_TEXT
#define STR_SERIALNUMBER_DUMMY L"000000000000000000000000"

// USB devices are supposed to implment a halt feature, which is
// rarely (if ever) used.  If you comment this line out, the halt
// code will be removed, saving 102 bytes of space (gcc 4.3.0).
// This is not strictly USB compliant, but works with all major
// operating systems.
//#define SUPPORT_ENDPOINT_HALT

/**************************************************************************
 *
 *  Endpoint Buffer Configuration
 *
 **************************************************************************/

//control transfer
#define ENDPOINT0_SIZE 32

//raw HID
#define RAWHID_USAGE_PAGE 0xFFAB // recommended: 0xFF00 to 0xFFFF
#define RAWHID_USAGE 0x0200      // recommended: 0x0100 to 0xFFFF

#define RAWHID_INTERFACE 0
#define RAWHID_TX_ENDPOINT 1
#define RAWHID_RX_ENDPOINT 2
#define RAWHID_TX_BUFFER EP_DOUBLE_BUFFER
#define RAWHID_RX_BUFFER EP_DOUBLE_BUFFER

#define RAWHID_TX_SIZE 64    // transmit packet size
#define RAWHID_TX_INTERVAL 2 // max # of ms between transmit packets
#define RAWHID_RX_SIZE 64    // receive packet size
#define RAWHID_RX_INTERVAL 8 // max # of ms between receive packets

//keyboard
#define KEYBOARD_INTERFACE 1
#define KEYBOARD_ENDPOINT 3
#define KEYBOARD_SIZE 8
#define KEYBOARD_BUFFER EP_DOUBLE_BUFFER

//mouse
#define MOUSE_INTERFACE 2
#define MOUSE_ENDPOINT 4
#define MOUSE_SIZE 8
#define MOUSE_BUFFER EP_DOUBLE_BUFFER

// static const uint8_t const PROGMEM keyboard_endpoint_config_table[] = {
//   0, 0, 1, EP_TYPE_INTERRUPT_IN, EP_SIZE(KEYBOARD_SIZE) | KEYBOARD_BUFFER, 0
// };

// static const uint8_t const PROGMEM mouse_endpoint_config_table[] = {
//   0, 0, 1, EP_TYPE_INTERRUPT_IN, EP_SIZE(MOUSE_SIZE) | MOUSE_BUFFER, 0
// };

/**************************************************************************
 *
 *  Descriptor Data
 *
 **************************************************************************/

// Descriptors are the data that your computer reads when it auto-detects
// this USB device (called "enumeration" in USB lingo).  The most commonly
// changed items are editable at the top of this file.  Changing things
// in here should only be done by those who've read chapter 9 of the USB
// spec and relevant portions of any USB class specifications!

static uint8_t const PROGMEM device_descriptor[] = {
  18, // bLength
  1,  // bDescriptorType
  0x00,
  0x02,           // bcdUSB
  0,              // bDeviceClass
  0,              // bDeviceSubClass
  0,              // bDeviceProtocol
  ENDPOINT0_SIZE, // bMaxPacketSize0
  LSB(VENDOR_ID),
  MSB(VENDOR_ID), // idVendor
  LSB(PRODUCT_ID),
  MSB(PRODUCT_ID), // idProduct
  0x00,
  0x01, // bcdDevice
  1,    // iManufacturer
  2,    // iProduct
  3,    // iSerialNumber
  1     // bNumConfigurations
};

static uint8_t const PROGMEM rawhid_hid_report_desc[] = {
  0x06,
  LSB(RAWHID_USAGE_PAGE),
  MSB(RAWHID_USAGE_PAGE),
  0x0A,
  LSB(RAWHID_USAGE),
  MSB(RAWHID_USAGE),
  0xA1,
  0x01, // Collection 0x01
  0x75,
  0x08, // report size = 8 bits
  0x15,
  0x00, // logical minimum = 0
  0x26,
  0xFF,
  0x00, // logical maximum = 255
  0x95,
  RAWHID_TX_SIZE, // report count
  0x09,
  0x01, // usage
  0x81,
  0x02, // Input (array)
  0x95,
  RAWHID_RX_SIZE, // report count
  0x09,
  0x02, // usage
  0x91,
  0x02, // Output (array)
  0xC0  // end collection
};

// Keyboard Protocol 1, HID 1.11 spec, Appendix B, page 59-60
static uint8_t const PROGMEM keyboard_hid_report_desc[] = {
  0x05, 0x01,       // Usage Page (Generic Desktop),
  0x09, 0x06,       // Usage (Keyboard),
  0xA1, 0x01,       // Collection (Application),
  0x75, 0x01,       //   Report Size (1),
  0x95, 0x08,       //   Report Count (8),
  0x05, 0x07,       //   Usage Page (Key Codes),
  0x19, 0xE0,       //   Usage Minimum (224),
  0x29, 0xE7,       //   Usage Maximum (231),
  0x15, 0x00,       //   Logical Minimum (0),
  0x25, 0x01,       //   Logical Maximum (1),
  0x81, 0x02,       //   Input (Data, Variable, Absolute), ;Modifier byte
  0x95, 0x01,       //   Report Count (1),
  0x75, 0x08,       //   Report Size (8),
  0x81, 0x03,       //   Input (Constant),                 ;Reserved byte
  0x95, 0x05,       //   Report Count (5),
  0x75, 0x01,       //   Report Size (1),
  0x05, 0x08,       //   Usage Page (LEDs),
  0x19, 0x01,       //   Usage Minimum (1),
  0x29, 0x05,       //   Usage Maximum (5),
  0x91, 0x02,       //   Output (Data, Variable, Absolute), ;LED report
  0x95, 0x01,       //   Report Count (1),
  0x75, 0x03,       //   Report Size (3),
  0x91, 0x03,       //   Output (Constant),                 ;LED report padding
  0x95, 0x06,       //   Report Count (6),
  0x75, 0x08,       //   Report Size (8),
  0x15, 0x00,       //   Logical Minimum (0),
  0x26, 0xFF, 0x00, // Logical maximum(255)
  0x05, 0x07,       //   Usage Page (Key Codes),
  0x19, 0x00,       //   Usage Minimum (0),
  0x29, 0xFF,       //   Usage Maximum (255),
  0x81, 0x00,       //   Input (Data, Array),
  0xc0              // End Collection
};

static const uint8_t PROGMEM mouse_hid_report_desc[] = {
  0x05, 0x01, // Usage Page (Generic Desktop)
  0x09, 0x02, // Usage (Mouse)
  0xa1, 0x01, // Collection (Application)

  // Buton status
  0x05, 0x09, //   Usage Page (Button)
  0x19, 0x01, //   Usage Minimum (Button #1)
  0x29, 0x03, //   Usage Maximum (Button #3)
  0x15, 0x00, //   Logical Minimum (0)
  0x25, 0x01, //   Logical Maximum (1)
  0x95, 0x03, //   Report Count (3)
  0x75, 0x01, //   Report Size (1)
  0x81, 0x02, //   Input (Data, Variable, Absolute)

  // Padding to byte boundary
  0x95, 0x01, //   Report Count (1)
  0x75, 0x05, //   Report Size (5)
  0x81, 0x03, //   Input (Constant)

  // X and Y axis
  0x05, 0x01, //   Usage Page (Generic Desktop)
  0x09, 0x30, //   Usage (X)
  0x09, 0x31, //   Usage (Y)
  0x15, 0x81, //   Logical Minimum (-127)
  0x25, 0x7f, //   Logical Maximum (127)
  0x75, 0x08, //   Report Size (8),
  0x95, 0x02, //   Report Count (2),
  0x81, 0x06, //   Input (Data, Variable, Relative)

  // Wheel rotation
  0x09, 0x38, //   Usage (Wheel)
  0x95, 0x01, //   Report Count (1),
  0x81, 0x06, //   Input (Data, Variable, Relative)
  0xC0        // End Collection
};

// #define CONFIG1_DESC_SIZE (9 + 9 + 9 + 7 + 9 + 9 + 7 + 9 + 9 + 7 + 7)
// #define KEYBOARD_HID_DESC_OFFSET (9 + 9)
// #define MOUSE_HID_DESC_OFFSET (9 + 9 + 9 + 7 + 9)
// #define RAWHID_HID_DESC_OFFSET (9 + 9 + 9 + 7 + 9 + 9 + 7 + 9) //todo:前にもってくる

#define CONFIG1_DESC_SIZE (9 + (9 + (9 + 7 + 7)) + (9 + (9 + 7)) + (9 + (9 + 7)))
#define RAWHID_HID_DESC_OFFSET (9 + 9)
#define KEYBOARD_HID_DESC_OFFSET (9 + (9 + 9 + 7 + 7) + 9)
#define MOUSE_HID_DESC_OFFSET (9 + (9 + 9 + 7 + 7) + (9 + 9 + 7) + 9)

static uint8_t const PROGMEM config1_descriptor[CONFIG1_DESC_SIZE] = {
  // ---- 全体 ----
  // configuration descriptor, USB spec 9.6.3, page 264-266, Table 9-10
  9,                      // bLength;
  2,                      // bDescriptorType;
  LSB(CONFIG1_DESC_SIZE), // wTotalLength
  MSB(CONFIG1_DESC_SIZE),
  // 1,    // bNumInterfaces
  3,    // bNumInterfaces
  1,    // bConfigurationValue
  0,    // iConfiguration
  0xC0, // bmAttributes
  50,   // bMaxPower

  // ---- ジェネリックHID ----
  // interface descriptor, USB spec 9.6.5, page 267-269, Table 9-12
  9,                // bLength
  4,                // bDescriptorType
  RAWHID_INTERFACE, // bInterfaceNumber
  0,                // bAlternateSetting
  2,                // bNumEndpoints
  0x03,             // bInterfaceClass (0x03 = HID)
  0x00,             // bInterfaceSubClass (0x01 = Boot)
  0x00,             // bInterfaceProtocol (0x01 = Keyboard)
  0,                // iInterface
  // HID interface descriptor, HID 1.11 spec, section 6.2.1
  9,                              // bLength
  0x21,                           // bDescriptorType
  0x11, 0x01,                     // bcdHID
  0,                              // bCountryCode
  1,                              // bNumDescriptors
  0x22,                           // bDescriptorType
  sizeof(rawhid_hid_report_desc), // wDescriptorLength
  0,
  // endpoint descriptor, USB spec 9.6.6, page 269-271, Table 9-13
  7,                         // bLength
  5,                         // bDescriptorType
  RAWHID_TX_ENDPOINT | 0x80, // bEndpointAddress
  0x03,                      // bmAttributes (0x03=intr)
  RAWHID_TX_SIZE, 0,         // wMaxPacketSize
  RAWHID_TX_INTERVAL,        // bInterval
  // endpoint descriptor, USB spec 9.6.6, page 269-271, Table 9-13
  7,                  // bLength
  5,                  // bDescriptorType
  RAWHID_RX_ENDPOINT, // bEndpointAddress
  0x03,               // bmAttributes (0x03=intr)
  RAWHID_RX_SIZE, 0,  // wMaxPacketSize
  RAWHID_RX_INTERVAL, // bInterval

  // ---- キーボード ----
  // interface descriptor, USB spec 9.6.5, page 267-269, Table 9-12
  9,                  // bLength
  4,                  // bDescriptorType
  KEYBOARD_INTERFACE, // bInterfaceNumber
  0,                  // bAlternateSetting
  1,                  // bNumEndpoints
  0x03,               // bInterfaceClass (0x03 = HID)
  0x01,               // bInterfaceSubClass (0x01 = Boot)
  0x01,               // bInterfaceProtocol (0x01 = Keyboard)
  0,                  // iInterface
  // HID interface descriptor, HID 1.11 spec, section 6.2.1
  9,                                // bLength
  0x21,                             // bDescriptorType
  0x11, 0x01,                       // bcdHID
  0,                                // bCountryCode
  1,                                // bNumDescriptors
  0x22,                             // bDescriptorType
  sizeof(keyboard_hid_report_desc), // wDescriptorLength
  0,
  // endpoint descriptor, USB spec 9.6.6, page 269-271, Table 9-13
  7,                        // bLength
  5,                        // bDescriptorType
  KEYBOARD_ENDPOINT | 0x80, // bEndpointAddress
  0x03,                     // bmAttributes (0x03=intr)
  KEYBOARD_SIZE, 0,         // wMaxPacketSize
  1,                        // bInterval

  // ---- マウス ----
  // interface descriptor, USB spec 9.6.5, page 267-269, Table 9-12
  9,               // bLength
  4,               // bDescriptorType
  MOUSE_INTERFACE, // bInterfaceNumber
  0,               // bAlternateSetting
  1,               // bNumEndpoints
  0x03,            // bInterfaceClass (0x03 = HID)
  0x01,            // bInterfaceSubClass (0x01 = Boot)
  0x02,            // bInterfaceProtocol (0x02 = Mouse)
  0,               // iInterface
  // HID interface descriptor, HID 1.11 spec, section 6.2.1
  9,                             // bLength
  0x21,                          // bDescriptorType
  0x11, 0x01,                    // bcdHID
  0,                             // bCountryCode
  1,                             // bNumDescriptors
  0x22,                          // bDescriptorType
  sizeof(mouse_hid_report_desc), // wDescriptorLength
  0,
  // endpoint descriptor, USB spec 9.6.6, page 269-271, Table 9-13
  7,                     // bLength
  5,                     // bDescriptorType
  MOUSE_ENDPOINT | 0x80, // bEndpointAddress
  0x03,                  // bmAttributes (0x03=intr)
  MOUSE_SIZE, 0,         // wMaxPacketSize
  1,                     // bInterval

};

// If you're desperate for a little extra code memory, these strings
// can be completely removed if iManufacturer, iProduct, iSerialNumber
// in the device desciptor are changed to zeros.
struct usb_string_descriptor_struct {
  uint8_t bLength;
  uint8_t bDescriptorType;
  int16_t wString[];
};
static struct usb_string_descriptor_struct const PROGMEM string0 = {
  4, 3, { 0x0409 }
};
static struct usb_string_descriptor_struct const PROGMEM string1 = {
  sizeof(STR_MANUFACTURER), 3, STR_MANUFACTURER
};
static struct usb_string_descriptor_struct const PROGMEM string2 = {
  sizeof(STR_PRODUCT), 3, STR_PRODUCT
};
static struct usb_string_descriptor_struct const PROGMEM string3_dummy = {
  sizeof(STR_SERIALNUMBER_DUMMY), 3, STR_SERIALNUMBER_DUMMY
};

//動的にシリアルナンバを指定するのためのバッファをRAM上に配置
static struct usb_string_descriptor_struct serialNumberStringDescriptorStruct = {
  sizeof(STR_SERIALNUMBER_DUMMY), 3, STR_SERIALNUMBER_DUMMY
};

// This table defines which descriptor data is sent for each specific
// request from the host (in wValue and wIndex).
static struct descriptor_list_struct {
  uint16_t wValue;
  uint16_t wIndex;
  const uint8_t *addr;
  uint8_t length;
} const PROGMEM descriptor_list[] = {
  { 0x0100, 0x0000, device_descriptor, sizeof(device_descriptor) },
  { 0x0200, 0x0000, config1_descriptor, sizeof(config1_descriptor) },
  { 0x2200, RAWHID_INTERFACE, rawhid_hid_report_desc,
    sizeof(rawhid_hid_report_desc) },
  { 0x2100, RAWHID_INTERFACE, config1_descriptor + RAWHID_HID_DESC_OFFSET, 9 },

  { 0x2200, KEYBOARD_INTERFACE, keyboard_hid_report_desc,
    sizeof(keyboard_hid_report_desc) },
  { 0x2100, KEYBOARD_INTERFACE, config1_descriptor + KEYBOARD_HID_DESC_OFFSET,
    9 },
  { 0x2200, MOUSE_INTERFACE, mouse_hid_report_desc,
    sizeof(mouse_hid_report_desc) },
  { 0x2100, MOUSE_INTERFACE, config1_descriptor + MOUSE_HID_DESC_OFFSET,
    9 },
  { 0x0300, 0x0000, (const uint8_t *)&string0, 4 },
  { 0x0301, 0x0409, (const uint8_t *)&string1, sizeof(STR_MANUFACTURER) },
  { 0x0302, 0x0409, (const uint8_t *)&string2, sizeof(STR_PRODUCT) },
  { 0x0303, 0x0409, (const uint8_t *)&string3_dummy, sizeof(STR_SERIALNUMBER_DUMMY) },
};
#define NUM_DESC_LIST \
  (sizeof(descriptor_list) / sizeof(struct descriptor_list_struct))

/**************************************************************************
 *
 *  Variables - these are the only non-stack RAM usage
 *
 **************************************************************************/

// zero when we are not configured, non-zero when enumerated
static volatile uint8_t usb_configuration = 0;

// which modifier keys are currently pressed
// 1=left ctrl,    2=left shift,   4=left alt,    8=left gui
// 16=right ctrl, 32=right shift, 64=right alt, 128=right gui
//uint8_t keyboard_modifier_keys = 0;

// which keys are currently pressed, up to 6 keys may be down at once
//uint8_t keyboard_keys[6] = { 0, 0, 0, 0, 0, 0 };

// protocol setting from the host.  We use exactly the same report
// either way, so this variable only stores the setting since we
// are required to be able to report which setting is in use.
//static uint8_t keyboard_protocol = 1;

// the idle configuration, how often we send the report to the
// host (ms * 4) even when it hasn't changed
static uint8_t keyboard_idle_config = 125;

// count until idle timeout
static uint8_t keyboard_idle_count = 0;

// 1=num lock, 2=caps lock, 4=scroll lock, 8=compose, 16=kana
static volatile uint8_t keyboard_leds = 0;

// these are a more reliable timeout than polling the
// frame counter (UDFNUML)
//static volatile uint8_t rx_timeout_count = 0;
//static volatile uint8_t tx_timeout_count = 0;

/**************************************************************************
 *
 *  Public Functions - these are the API intended for the user
 *
 **************************************************************************/

// #define HW_CONFIG() (UHWCON = 0x01)
// #define PLL_CONFIG() (PLLCSR = 0x12)
// #define USB_CONFIG() (USBCON = ((1 << USBE) | (1 << OTGPADE)))
// #define USB_FREEZE() (USBCON = ((1 << USBE) | (1 << FRZCLK)))

// initialize USB
// void usb_init(void) {
//   // HW_CONFIG();
//   // USB_FREEZE();
//   // PLL_CONFIG(); // config PLL
// }

// return 0 if the USB is not configured, or the configuration
// number selected by the HOST
//uint8_t usb_configured(void) { return usb_configuration; }

static void initUSB() {
  CPU_PRESCALE(0);

  // Initialize the USB, and then wait for the host to set configuration.
  // If the Teensy is powered without a PC connected to the USB port,
  // this will wait forever.
  //usb_init();

  UHWCON = 0x01;
  USBCON = (1 << USBE) | (1 << FRZCLK);

  PLLCSR = 0x12;                      //PLL設定
  while (!(PLLCSR & (1 << PLOCK))) {} //PLL Lockを待つ

  USBCON = (1 << USBE) | (1 << OTGPADE); // start USB clock

  UDCON = 0; // enable attach resistor
  usb_configuration = 0;
  UDIEN = (1 << EORSTE) | (1 << SOFE); //End Of Resume, Start of Frame 割り込み有効化

  // sei();

  // while (!usb_configuration) {} /* wait */

  // Wait an extra second for the PC's operating system to load drivers
  // and do whatever it does to actually be ready for input
  // _delay_ms(1000);
}

/*
Innterrpt IN パイプによるデバイスからホストへのデータ送信

(マイコンのユーザプログラム上での処理)
デバイス上のアプリケーションコードで、任意のタイミングでInnterupt IN EP FIFOへの書き込みを試みる
  FIFOが埋まっていたら空きが出るまで待つ
   一定時間待っても空きが出ないなら、書き込みをあきらめる
  FIFOに書き込む

(マイコン内臓USBコントローラで行われる処理)
FIFOに書き込んだデータは、ホストから(一定時間おきの)取得要求があった場合に送出される
  FIFOにデータがあればACK応答とともにデータが送られる
  FIFOにデータがなければNAK応答を返す

ホストは一定時間おきのポーリングでデバイスに対してSOF(Start Of Frame)パケットを送り、データ取得を試みる
 デバイスは応答するべきデータがあればデータとともにACKを返す
 データがなければNAKを返す
*/

/*
UENUMレジスタのEPNUM値により対象のエンドポイントごとに内容が切り替わるレジスタ
 UECONX, USB Endpoint X Control Register
 UECFG0X, USB Endpoint X Configuration 0 Register
 UECFG1X, USB Endpoint X Configuration 1 Register
 UESTA0X, USB Endpoint X Status 0 Register
 UESTA1X, USB Endpoint X Status 1 Register
 UEINTX, USB Endpoint X Interrupt Register
 UEIENX, USB Endpoint X Interrupt Enable Register
 UEDATX, USB Endpoint X Data Register
*/

// USB Device Interrupt - handle all device-level events
// the transmit buffer flushing is triggered by the start of frame
//
ISR(USB_GEN_vect) {
  uint8_t intbits; //, t, i;
  //static uint8_t div4 = 0;

#ifdef TIMING_DEBUG
  bit_off(PORTE, 6);
#endif

  intbits = UDINT;
  UDINT = 0;
  if (intbits & (1 << EORSTI)) {
    //USB Device Interrupt, End of Resume Interrupt
    //USBデバイスがホストによって開始されたときに呼ばれる
    dprintf("EORSTI\n");
    //EP0設定
    UENUM = 0;
    UECONX = 1;
    UECFG0X = EP_TYPE_CONTROL;
    UECFG1X = EP_SIZE(ENDPOINT0_SIZE) | EP_SINGLE_BUFFER;
    UEIENX = (1 << RXSTPE);
    usb_configuration = 0;
  }
  if ((intbits & (1 << SOFI)) && usb_configuration) {
    //Start Of Frame Intterupt
    //フレーム開始(SOF)PIDが検知されたときに呼ばれる

    // uint8_t t = rx_timeout_count;
    // if (t) {
    //   rx_timeout_count = --t;
    // }
    // t = tx_timeout_count;
    // if (t) {
    //   tx_timeout_count = --t;
    // }

    //printf("SOFI\n");
    // if (keyboard_idle_config && (++div4 & 3) == 0) {
    //   UENUM = KEYBOARD_ENDPOINT;
    //   if (UEINTX & (1 << RWAL)) {
    //     keyboard_idle_count++;
    //     if (keyboard_idle_count == keyboard_idle_config) {
    //       keyboard_idle_count = 0;
    //       UEDATX = keyboard_modifier_keys;
    //       UEDATX = 0;
    //       for (i = 0; i < 6; i++) {
    //         UEDATX = keyboard_keys[i];
    //       }
    //       UEINTX = 0x3A;
    //     }
    //   }
    // }
  }
#ifdef TIMING_DEBUG
  bit_on(PORTE, 6);
#endif
}

// Misc functions to wait for ready and send/receive packets
static inline void usb_wait_in_ready(void) {
  while (!(UEINTX & (1 << TXINI)))
    ;
}
static inline void usb_send_in(void) { UEINTX = ~(1 << TXINI); }
static inline void usb_wait_receive_out(void) {
  while (!(UEINTX & (1 << RXOUTI)))
    ;
}
static inline void usb_ack_out(void) { UEINTX = ~(1 << RXOUTI); }

// USB Endpoint Interrupt - endpoint 0 is handled here.  The
// other endpoints are manipulated by the user-callable
// functions, and the start-of-frame interrupt.
//
ISR(USB_COM_vect) {
  uint8_t intbits;
  const uint8_t *list;
  //const uint8_t *cfg;
  uint8_t i, n, len; //, en;
  uint8_t bmRequestType;
  uint8_t bRequest;
  uint16_t wValue;
  uint16_t wIndex;
  uint16_t wLength;
  uint16_t desc_val;
  const uint8_t *desc_addr;
  uint8_t desc_length;

  // bit_on(PINE, 6);

  UENUM = 0;
  intbits = UEINTX;
  if (intbits & (1 << RXSTPI)) {
    bmRequestType = UEDATX;
    bRequest = UEDATX;
    wValue = UEDATX;
    wValue |= (UEDATX << 8);
    wIndex = UEDATX;
    wIndex |= (UEDATX << 8);
    wLength = UEDATX;
    wLength |= (UEDATX << 8);
    UEINTX = ~((1 << RXSTPI) | (1 << RXOUTI) | (1 << TXINI));

    dprintf("RXSTPI 0x%x 0x%x 0x%x 0x%x\n", bmRequestType, bRequest, wValue, wIndex);

    if (bRequest == GET_DESCRIPTOR) {
      dprintf("GET_DESCRIPTOR, 0x%x\n", wValue);

      list = (const uint8_t *)descriptor_list;
      for (i = 0;; i++) {
        if (i >= NUM_DESC_LIST) {
          dprintf("STALL\n");
          UECONX = (1 << STALLRQ) | (1 << EPEN); // stall
          return;
        }
        desc_val = pgm_read_word(list);
        if (desc_val != wValue) {
          list += sizeof(struct descriptor_list_struct);
          continue;
        }
        list += 2;
        desc_val = pgm_read_word(list);
        if (desc_val != wIndex) {
          list += sizeof(struct descriptor_list_struct) - 2;
          continue;
        }
        list += 2;
        desc_addr = (const uint8_t *)pgm_read_word(list);
        list += 2;
        desc_length = pgm_read_byte(list);
        break;
      }

      dprintf("desc length, %d\n", desc_length);

      uint8_t *desc_add_serialnumber = (uint8_t *)&serialNumberStringDescriptorStruct;

      len = (wLength < 256) ? wLength : 255;
      if (len > desc_length)
        len = desc_length;
      do {
        // wait for host ready for IN packet
        do {
          i = UEINTX;
        } while (!(i & ((1 << TXINI) | (1 << RXOUTI))));
        if (i & (1 << RXOUTI))
          return; // abort
        // send IN packet
        n = len < ENDPOINT0_SIZE ? len : ENDPOINT0_SIZE;

        if (wValue == 0x0303) {
          //serialNumberの読み出しの場合、ROM上の固定のDescriptor定義ではなくRAM上にあるバッファから値を読み取る
          for (i = n; i; i--) {
            UEDATX = *(desc_add_serialnumber++);
          }
        } else {
          for (i = n; i; i--) {
            UEDATX = pgm_read_byte(desc_addr++);
          }
        }

        len -= n;
        usb_send_in();
      } while (len || n == ENDPOINT0_SIZE);

      return;
    }
    if (bRequest == SET_ADDRESS) {
      dprintf("SET_ADDRESS: --> %d\n", wValue);
      usb_send_in();
      usb_wait_in_ready();
      UDADDR = wValue | (1 << ADDEN);
      return;
    }
    if (bRequest == SET_CONFIGURATION && bmRequestType == 0) {
      dprintf("SET_CONFIGURATION: --> %d\n", wValue);
      usb_configuration = wValue;
      usb_send_in();

      //rawhid EP1EP2設定
      UENUM = RAWHID_TX_ENDPOINT;
      UECONX = 1;
      UECFG0X = EP_TYPE_INTERRUPT_IN;
      UECFG1X = EP_SIZE(RAWHID_TX_SIZE) | RAWHID_TX_BUFFER;

      UENUM = RAWHID_RX_ENDPOINT;
      UECONX = 1;
      UECFG0X = EP_TYPE_INTERRUPT_OUT;
      UECFG1X = EP_SIZE(RAWHID_RX_SIZE) | RAWHID_RX_BUFFER;

      //キーボードEP3設定
      UENUM = KEYBOARD_ENDPOINT;
      UECONX = 1;
      UECFG0X = EP_TYPE_INTERRUPT_IN;
      UECFG1X = EP_SIZE(KEYBOARD_SIZE) | KEYBOARD_BUFFER;

      //マウスEP4設定
      UENUM = MOUSE_ENDPOINT;
      UECONX = 1;
      UECFG0X = EP_TYPE_INTERRUPT_IN;
      UECFG1X = EP_SIZE(KEYBOARD_SIZE) | MOUSE_BUFFER;

      printf("usb device configured\n");

      UERST = 0x1E;
      UERST = 0;
      return;
    }
    // if (bRequest == GET_CONFIGURATION && bmRequestType == 0x80 && 0) {
    //   printf("GET_CONFIGURATION: <-- %d\n", usb_configuration);
    //   usb_wait_in_ready();
    //   UEDATX = usb_configuration;
    //   usb_send_in();
    //   return;
    // }

    // if (bRequest == GET_STATUS && 0) {
    //   printf("GET_STATUS\n");
    //   usb_wait_in_ready();
    //   i = 0;
    //   UEDATX = i;
    //   UEDATX = 0;
    //   usb_send_in();
    //   return;
    // }

    if (wIndex == RAWHID_INTERFACE) {
      if (bmRequestType == 0xA1) {
        // if (bRequest == HID_GET_REPORT && 0) {
        //   printf("rawhid get report\n");
        //   len = RAWHID_TX_SIZE;
        //   do {
        //     // wait for host ready for IN packet
        //     do {
        //       i = UEINTX;
        //     } while (!(i & ((1 << TXINI) | (1 << RXOUTI))));
        //     if (i & (1 << RXOUTI))
        //       return; // abort
        //     // send IN packet
        //     n = len < ENDPOINT0_SIZE ? len : ENDPOINT0_SIZE;
        //     for (i = n; i; i--) {
        //       // just send zeros
        //       UEDATX = 0;
        //     }
        //     len -= n;
        //     usb_send_in();
        //   } while (len || n == ENDPOINT0_SIZE);
        //   return;
        // }
      }
      if (bmRequestType == 0x21) {
        // if (bRequest == HID_SET_REPORT && 0) {
        //   printf("rawhid set report\n");
        //   len = RAWHID_RX_SIZE;
        //   do {
        //     n = len < ENDPOINT0_SIZE ? len : ENDPOINT0_SIZE;
        //     usb_wait_receive_out();
        //     // ignore incoming bytes
        //     usb_ack_out();
        //     len -= n;
        //   } while (len);
        //   usb_wait_in_ready();
        //   usb_send_in();
        //   return;
        // }
        if (bRequest == HID_SET_IDLE) {
          uint8_t config = (wValue >> 8);
          dprintf("rawhid set idle %d\n", config);
          //printf("HID_SET_IDLE %d\n", config);
          //keyboard_idle_count = 0;
          usb_send_in();
          return;
        }
      }
    }

    if (wIndex == KEYBOARD_INTERFACE) {
      dprintf("KEYBOARD_INTERFACE 0x%x 0x%x\n", bmRequestType, bRequest);

      // if (bmRequestType == 0xA1 && 0) {
      //   if (bRequest == HID_GET_REPORT) {
      //     printf("HID_GET_REPORT\n");
      //     usb_wait_in_ready();
      //     UEDATX = keyboard_modifier_keys;
      //     UEDATX = 0;
      //     for (i = 0; i < 6; i++) {
      //       UEDATX = keyboard_keys[i];
      //     }
      //     usb_send_in();
      //     return;
      //   }
      //   if (bRequest == HID_GET_IDLE) {
      //     printf("HID_GET_IDLE\n");
      //     usb_wait_in_ready();
      //     UEDATX = keyboard_idle_config;
      //     usb_send_in();
      //     return;
      //   }
      //   if (bRequest == HID_GET_PROTOCOL) {
      //     printf("HID_GET_PROTOCOL\n");
      //     usb_wait_in_ready();
      //     UEDATX = keyboard_protocol;
      //     usb_send_in();
      //     return;
      //   }
      // }

      if (bmRequestType == 0x21) {
        if (bRequest == HID_SET_REPORT) {

          usb_wait_receive_out();
          keyboard_leds = UEDATX;
          dprintf("HID_SET_REPORT %d\n", keyboard_leds);
          usb_ack_out();
          usb_send_in();
          return;
        }
        if (bRequest == HID_SET_IDLE) {
          keyboard_idle_config = (wValue >> 8);
          dprintf("HID_SET_IDLE %d\n", keyboard_idle_config);
          keyboard_idle_count = 0;
          usb_send_in();
          return;
        }

        // if (bRequest == HID_SET_PROTOCOL && 0) {
        //   printf("HID_SET_PROTOCOL\n");
        //   keyboard_protocol = wValue;
        //   usb_send_in();
        //   return;
        // }
      }
    }

    if (wIndex == MOUSE_INTERFACE) {
      dprintf("MOUSE_INTERFACE 0x%x 0x%x\n", bmRequestType, bRequest);
      if (bmRequestType == 0x21) {
        // if (bRequest == HID_SET_REPORT) {
        //   usb_wait_receive_out();
        //   uint8_t value = UEDATX;
        //   printf("HID_SET_REPORT %d\n", value);
        //   usb_ack_out();
        //   usb_send_in();
        //   return;
        // }
        if (bRequest == HID_SET_IDLE) {
          uint8_t mouse_idle_config = (wValue >> 8);
          dprintf("HID_SET_IDLE %d\n", mouse_idle_config);
          //uint8_t mouse_idel_count = 0;
          usb_send_in();
          return;
        }
      }
    }

    dprintf("--unhandled-- %x %x %x \n", bRequest, wIndex, wValue);
  }
  UECONX = (1 << STALLRQ) | (1 << EPEN); // stall
  dprintf("STALL\n");
}

//------------------------------------------------------------
//endpoint accessors

static bool hidKeyboard_writeReport(uint8_t *pReportBytes8) {
  if (!usb_configuration) {
    return false;
  }
  UENUM = KEYBOARD_ENDPOINT;
  if (!bit_is_on(UEINTX, RWAL)) {
    return false;
  }
  cli();
  for (uint8_t i = 0; i < 8; i++) {
    UEDATX = pReportBytes8[i];
  }
  UEINTX = 0x3A;
  sei();
  return true;
}

static bool hidKeyboard_writeKeyStatus(uint8_t modifier, uint8_t *pKeyUsages6) {
  if (!usb_configuration) {
    return false;
  }
  UENUM = KEYBOARD_ENDPOINT;
  if (!bit_is_on(UEINTX, RWAL)) {
    return false;
  }
  cli();
  UEDATX = modifier;
  UEDATX = 0;
  for (uint8_t i = 0; i < 6; i++) {
    UEDATX = pKeyUsages6[i];
  }
  UEINTX = 0x3A;
  sei();
  return true;
}

static bool genericHid_writeData(uint8_t *pDataBytes64) {
  if (!usb_configuration) {
    return false;
  }
  UENUM = RAWHID_TX_ENDPOINT;
  if (!bit_is_on(UEINTX, RWAL)) {
    return false;
  }
  cli();
  for (uint8_t i = 0; i < 64; i++) {
    UEDATX = pDataBytes64[i];
  }
  UEINTX = 0x3A;
  sei();
  return true;
}

static bool genericHid_readDataIfExists(uint8_t *pDataBytes64) {
  if (!usb_configuration) {
    return false;
  }
  UENUM = RAWHID_RX_ENDPOINT;
  if (!bit_is_on(UEINTX, RWAL)) {
    return false;
  }
  cli();
  for (uint8_t i = 0; i < 64; i++) {
    pDataBytes64[i] = UEDATX;
  }
  UEINTX = 0x6B;
  sei();
  return true;
}

//------------------------------------------------------------
//exports

void usbIoCore_initialize() {
  initUSB();
}

bool usbIoCore_hidKeyboard_writeKeyStatus(uint8_t modifier, uint8_t *pKeyUsages6) {
  return hidKeyboard_writeKeyStatus(modifier, pKeyUsages6);
}

bool usbIoCore_hidKeyboard_writeReport(uint8_t *pReportBytes8) {
  return hidKeyboard_writeReport(pReportBytes8);
}

bool usbIoCore_genericHid_writeData(uint8_t *pDataBytes64) {
  return genericHid_writeData(pDataBytes64);
}

bool usbIoCore_genericHid_readDataIfExists(uint8_t *pDataBytes64) {
  return genericHid_readDataIfExists(pDataBytes64);
}

bool usbIoCore_isConnectedToHost() {
  return usb_configuration != 0;
}

void uibioCore_internal_setSerialNumberText(uint8_t *pTextBuf, uint8_t len) {
  if (len > 24) {
    len = 24;
  }
  utils_copyStringToWideString(serialNumberStringDescriptorStruct.wString, pTextBuf, len);
}

void usbIoCore_processUpdate() {}
//------------------------------------------------------------
