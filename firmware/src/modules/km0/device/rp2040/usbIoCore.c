//based on tinyusb multiple interfaces example

#include "km0/device/usbIoCore.h"
#include "km0/base/configImport.h"
#include "km0/base/utils.h"
#include "tinyusb/src/tusb.h"

//--------------------------------------------------------------------
// Definitions

#ifndef KM0_USB__VENDOR_ID
#define KM0_USB__VENDOR_ID 0xF055
#endif

#ifndef KM0_USB__PRODUCT_ID
#define KM0_USB__PRODUCT_ID 0xA579
#endif

#ifndef KM0_USB__MANUFACTURER_TEXT
#define KM0_USB__MANUFACTURER_TEXT "Kermite"
#endif

#ifndef KM0_USB__PRODUCT_TEXT
#define KM0_USB__PRODUCT_TEXT "Kermite Keyboard Device"
#endif

enum {
  ITF_KEYBOARD = 0,
  ITF_MOUSE = 1,
  ITF_RAWHID = 2,
  ITF_NUM_INTERFACES = 3,
};

volatile static bool isConnected = false;

//--------------------------------------------------------------------
// Device Descriptors

static tusb_desc_device_t const desc_device = {
  .bLength = sizeof(tusb_desc_device_t),
  .bDescriptorType = TUSB_DESC_DEVICE,
  .bcdUSB = 0x0200,
  .bDeviceClass = 0x00,
  .bDeviceSubClass = 0x00,
  .bDeviceProtocol = 0x00,
  .bMaxPacketSize0 = CFG_TUD_ENDPOINT0_SIZE,

  .idVendor = KM0_USB__VENDOR_ID,
  .idProduct = KM0_USB__PRODUCT_ID,
  .bcdDevice = 0x0100,

  .iManufacturer = 0x01,
  .iProduct = 0x02,
  .iSerialNumber = 0x03,

  .bNumConfigurations = 0x01
};

uint8_t const *tud_descriptor_device_cb(void) {
  return (uint8_t const *)&desc_device;
}

//--------------------------------------------------------------------
// HID Report Descriptors

// clang-format off
// Keyboard Report Descriptor Template
#define TUD_HID_REPORT_DESC_KEYBOARD__MODIFIED(...) \
  HID_USAGE_PAGE ( HID_USAGE_PAGE_DESKTOP     )                    ,\
  HID_USAGE      ( HID_USAGE_DESKTOP_KEYBOARD )                    ,\
  HID_COLLECTION ( HID_COLLECTION_APPLICATION )                    ,\
    /* Report ID if any */\
    __VA_ARGS__ \
    /* 8 bits Modifier Keys (Shfit, Control, Alt) */ \
    HID_USAGE_PAGE ( HID_USAGE_PAGE_KEYBOARD )                     ,\
      HID_USAGE_MIN    ( 224                                    )  ,\
      HID_USAGE_MAX    ( 231                                    )  ,\
      HID_LOGICAL_MIN  ( 0                                      )  ,\
      HID_LOGICAL_MAX  ( 1                                      )  ,\
      HID_REPORT_COUNT ( 8                                      )  ,\
      HID_REPORT_SIZE  ( 1                                      )  ,\
      HID_INPUT        ( HID_DATA | HID_VARIABLE | HID_ABSOLUTE )  ,\
      /* 8 bit reserved */ \
      HID_REPORT_COUNT ( 1                                      )  ,\
      HID_REPORT_SIZE  ( 8                                      )  ,\
      HID_INPUT        ( HID_CONSTANT                           )  ,\
    /* 6-byte Keycodes */ \
    HID_USAGE_PAGE ( HID_USAGE_PAGE_KEYBOARD )                     ,\
      HID_USAGE_MIN    ( 0                                   )     ,\
      HID_USAGE_MAX    ( 255                                 )     ,\
      HID_LOGICAL_MIN  ( 0                                   )     ,\
      /*HID_LOGICAL_MAX  ( 255                               )   ,*/\
      HID_LOGICAL_MAX_N  ( 255, 2 ) /*JISキーボードで\_¥|などの文字が入力できない問題を改善*/ ,\
      HID_REPORT_COUNT ( 6                                   )     ,\
      HID_REPORT_SIZE  ( 8                                   )     ,\
      HID_INPUT        ( HID_DATA | HID_ARRAY | HID_ABSOLUTE )     ,\
    /* 5-bit LED Indicator Kana | Compose | ScrollLock | CapsLock | NumLock */ \
    HID_USAGE_PAGE  ( HID_USAGE_PAGE_LED                   )       ,\
      HID_USAGE_MIN    ( 1                                       ) ,\
      HID_USAGE_MAX    ( 5                                       ) ,\
      HID_REPORT_COUNT ( 5                                       ) ,\
      HID_REPORT_SIZE  ( 1                                       ) ,\
      HID_OUTPUT       ( HID_DATA | HID_VARIABLE | HID_ABSOLUTE  ) ,\
      /* led padding */ \
      HID_REPORT_COUNT ( 1                                       ) ,\
      HID_REPORT_SIZE  ( 3                                       ) ,\
      HID_OUTPUT       ( HID_CONSTANT                            ) ,\
  HID_COLLECTION_END
// clang-format on

// clang-format off
// Mouse Report Descriptor Template
#define TUD_HID_REPORT_DESC_MOUSE__MODIFIED(...) \
  HID_USAGE_PAGE ( HID_USAGE_PAGE_DESKTOP      )                   ,\
  HID_USAGE      ( HID_USAGE_DESKTOP_MOUSE     )                   ,\
  HID_COLLECTION ( HID_COLLECTION_APPLICATION  )                   ,\
    /* Report ID if any */\
    __VA_ARGS__ \
    HID_USAGE      ( HID_USAGE_DESKTOP_POINTER )                   ,\
    HID_COLLECTION ( HID_COLLECTION_PHYSICAL   )                   ,\
      HID_USAGE_PAGE  ( HID_USAGE_PAGE_BUTTON  )                   ,\
        HID_USAGE_MIN   ( 1                                      ) ,\
        HID_USAGE_MAX   ( 5                                      ) ,\
        HID_LOGICAL_MIN ( 0                                      ) ,\
        HID_LOGICAL_MAX ( 1                                      ) ,\
        /* Left, Right, Middle, Backward, Forward buttons */ \
        HID_REPORT_COUNT( 5                                      ) ,\
        HID_REPORT_SIZE ( 1                                      ) ,\
        HID_INPUT       ( HID_DATA | HID_VARIABLE | HID_ABSOLUTE ) ,\
        /* 3 bit padding */ \
        HID_REPORT_COUNT( 1                                      ) ,\
        HID_REPORT_SIZE ( 3                                      ) ,\
        HID_INPUT       ( HID_CONSTANT                           ) ,\
      HID_USAGE_PAGE  ( HID_USAGE_PAGE_DESKTOP )                   ,\
        /* X, Y position [-127, 127] */ \
        HID_USAGE       ( HID_USAGE_DESKTOP_X                    ) ,\
        HID_USAGE       ( HID_USAGE_DESKTOP_Y                    ) ,\
        HID_LOGICAL_MIN ( 0x81                                   ) ,\
        HID_LOGICAL_MAX ( 0x7f                                   ) ,\
        HID_REPORT_COUNT( 2                                      ) ,\
        HID_REPORT_SIZE ( 8                                      ) ,\
        HID_INPUT       ( HID_DATA | HID_VARIABLE | HID_RELATIVE ) ,\
    HID_COLLECTION_END                                            , \
  HID_COLLECTION_END \
// clang-format on

static uint8_t const desc_hid_report_keyboard[] = {
  TUD_HID_REPORT_DESC_KEYBOARD__MODIFIED()
};

static uint8_t const desc_hid_report_mouse[] = {
  TUD_HID_REPORT_DESC_MOUSE__MODIFIED()
};

static uint8_t const desc_hid_report_rawhid[] = {
  TUD_HID_REPORT_DESC_GENERIC_INOUT(CFG_TUD_HID_EP_BUFSIZE)
};

uint8_t const *tud_hid_descriptor_report_cb(uint8_t itf) {
  if (itf == ITF_KEYBOARD) {
    return desc_hid_report_keyboard;
  } else if (itf == ITF_MOUSE) {
    return desc_hid_report_mouse;
  } else if (itf == ITF_RAWHID) {
    return desc_hid_report_rawhid;
  }
  return NULL;
}

//--------------------------------------------------------------------
// Configuration Descriptor

#define CONFIG_TOTAL_LEN (TUD_CONFIG_DESC_LEN + TUD_HID_DESC_LEN + TUD_HID_DESC_LEN + TUD_HID_INOUT_DESC_LEN)

#define EPNUM_HID_MOUSE 0x81
#define EPNUM_HID_KEYBOARD 0x82
#define EPNUM_HID_RAWHID 0x03

static uint8_t const desc_configuration[] = {
  // Config number, interface count, string index, total length, attribute, power in mA
  TUD_CONFIG_DESCRIPTOR(1, 3, 0, CONFIG_TOTAL_LEN, TUSB_DESC_CONFIG_ATT_REMOTE_WAKEUP, 100),

  // Interface number, string index, protocol, report descriptor len, EP In & Out address, size & polling interval
  TUD_HID_DESCRIPTOR(ITF_KEYBOARD, 0, HID_ITF_PROTOCOL_NONE, sizeof(desc_hid_report_keyboard), EPNUM_HID_KEYBOARD, CFG_TUD_HID_EP_BUFSIZE, 10),
  TUD_HID_DESCRIPTOR(ITF_MOUSE, 0, HID_ITF_PROTOCOL_NONE, sizeof(desc_hid_report_mouse), EPNUM_HID_MOUSE, CFG_TUD_HID_EP_BUFSIZE, 10),
  // Interface number, string index, protocol, report descriptor len, EP In & Out address, size & polling interval
  TUD_HID_INOUT_DESCRIPTOR(ITF_RAWHID, 0, HID_ITF_PROTOCOL_NONE, sizeof(desc_hid_report_rawhid), EPNUM_HID_RAWHID,
                           0x80 | EPNUM_HID_RAWHID, CFG_TUD_HID_EP_BUFSIZE, 10)

};

uint8_t const *tud_descriptor_configuration_cb(uint8_t index) {
  return desc_configuration;
}

//--------------------------------------------------------------------
// String Descriptors

// array of pointer to string descriptors
static char const *string_desc_arr[] = {
  (const char[]){ 0x09, 0x04 }, // 0: is supported language is English (0x0409)
  KM0_USB__MANUFACTURER_TEXT,   // 1: Manufacturer
  KM0_USB__PRODUCT_TEXT,        // 2: Product
  "000000000000000000000000",   // 3: Serials, should use chip ID
};

static char altSerialNumberTextBuf[] = "000000000000000000000000";

static uint16_t _desc_str[32];

uint16_t const *tud_descriptor_string_cb(uint8_t index, uint16_t langid) {
  uint8_t chr_count;
  if (index == 0) {
    memcpy(&_desc_str[1], string_desc_arr[0], 2);
    chr_count = 1;
  } else {
    // Note: the 0xEE index string is a Microsoft OS 1.0 Descriptors.
    // https://docs.microsoft.com/en-us/windows-hardware/drivers/usbcon/microsoft-defined-usb-descriptors

    if (!(index < sizeof(string_desc_arr) / sizeof(string_desc_arr[0])))
      return NULL;

    const char *str = string_desc_arr[index];

    if (index == 3) {
      str = altSerialNumberTextBuf;
    }

    // Cap at max char
    chr_count = strlen(str);
    if (chr_count > 31)
      chr_count = 31;

    // Convert ASCII string into UTF-16
    for (uint8_t i = 0; i < chr_count; i++) {
      _desc_str[1 + i] = str[i];
    }
  }

  // first byte is length (including header), second byte is string type
  _desc_str[0] = (TUSB_DESC_STRING << 8) | (2 * chr_count + 2);

  return _desc_str;
}

//--------------------------------------------------------------------
// Device Callbacks

void tud_mount_cb(void) {
  isConnected = true;
}

void tud_umount_cb(void) {
  isConnected = false;
}

//--------------------------------------------------------------------
// HID Report Callbacks

// Invoked when received GET_REPORT control request
// Application must fill buffer report's content and return its length.
// Return zero will cause the stack to STALL request
uint16_t tud_hid_get_report_cb(uint8_t itf, uint8_t report_id, hid_report_type_t report_type, uint8_t *buffer, uint16_t reqlen) {
  // TODO not Implemented
  (void)itf;
  (void)report_id;
  (void)report_type;
  (void)buffer;
  (void)reqlen;
  return 0;
}

//TOOD: 必要なら多面バッファを構成
static uint8_t rawHidReceivedBuf[64];
static uint32_t rawHidReceivedPageCount = 0;

// Invoked when received SET_REPORT control request
// or received data on OUT endpoint ( Report ID = 0, Type = 0 )
void tud_hid_set_report_cb(uint8_t itf, uint8_t report_id, hid_report_type_t report_type, uint8_t const *buffer, uint16_t bufsize) {
  printf("received %d %d %d, %d bytes\n", itf, report_id, report_type, bufsize);

  if (itf == ITF_RAWHID) {
    memcpy(rawHidReceivedBuf, buffer, bufsize);
    rawHidReceivedPageCount++;
  }
}

//--------------------------------------------------------------------

//RawHIDのフレームを複数続けて送りたい場合に、後続のフレームが書き込めず失われるため
//多面バッファを使用して送信する
//TODO: 無駄が多いので、複数のリアルタイムイベントを1つのフレームに詰めて送る実装にしたい

#define RawHidTxBufPageNum 8
static uint8_t rawhid_txbuf[RawHidTxBufPageNum][64] = { 0 };
static bool rawhid_txbuf_flags[RawHidTxBufPageNum] = { 0 };
static int rawhid_txbuf_wi = 0;
static int rawhid_txbuf_ri = 0;

static void enqueueRawHidEmitInternalBuffer(uint8_t *pDataBytes64) {
  memcpy(rawhid_txbuf[rawhid_txbuf_wi], pDataBytes64, 64);
  rawhid_txbuf_flags[rawhid_txbuf_wi] = true;
  rawhid_txbuf_wi = (rawhid_txbuf_wi + 1) % RawHidTxBufPageNum;
}

static void shiftOutRawHidEmitInternalBuffer() {
  if (rawhid_txbuf_flags[rawhid_txbuf_ri]) {
    if (tud_hid_n_ready(ITF_RAWHID)) {
      tud_hid_n_report(ITF_RAWHID, 0, rawhid_txbuf[rawhid_txbuf_ri], 64);
      rawhid_txbuf_flags[rawhid_txbuf_ri] = false;
      rawhid_txbuf_ri = (rawhid_txbuf_ri + 1) % RawHidTxBufPageNum;
    }
  }
}

//--------------------------------------------------------------------

#define KeyboardTxBufPageNum 4
static uint8_t keboard_txbuf[KeyboardTxBufPageNum][8] = { 0 };
static bool keboard_txbuf_flags[KeyboardTxBufPageNum] = { 0 };
static int keboard_txbuf_wi = 0;
static int keboard_txbuf_ri = 0;

static void enqueueKeyboardEmitInternalBuffer(uint8_t *pDataBytes64) {
  memcpy(keboard_txbuf[keboard_txbuf_wi], pDataBytes64, 8);
  keboard_txbuf_flags[keboard_txbuf_wi] = true;
  keboard_txbuf_wi = (keboard_txbuf_wi + 1) % KeyboardTxBufPageNum;
}

static void shiftOutKeyboardEmitInternalBuffer() {
  if (keboard_txbuf_flags[keboard_txbuf_ri]) {
    if (tud_hid_n_ready(ITF_KEYBOARD)) {
      tud_hid_n_report(ITF_KEYBOARD, 0, keboard_txbuf[keboard_txbuf_ri], 8);
      keboard_txbuf_flags[keboard_txbuf_ri] = false;
      keboard_txbuf_ri = (keboard_txbuf_ri + 1) % KeyboardTxBufPageNum;
    }
  }
}

//--------------------------------------------------------------------

// Invoked when sent REPORT successfully to host
// Application can use this to send the next report
// Note: For composite reports, report[0] is report ID
void tud_hid_report_complete_cb(uint8_t itf, uint8_t const *report, uint8_t len) {
  (void)len;
  if (itf == ITF_KEYBOARD) {
    shiftOutKeyboardEmitInternalBuffer();
  } else if (itf == ITF_RAWHID) {
    shiftOutRawHidEmitInternalBuffer();
  }
}

//--------------------------------------------------------------------
// exports

void usbIoCore_initialize() {
  tusb_init();
}

bool usbIoCore_hidKeyboard_writeReport(uint8_t *pReportBytes8) {
  if (tud_hid_n_ready(ITF_KEYBOARD)) {
    tud_hid_n_report(ITF_KEYBOARD, 0, pReportBytes8, 8);
  } else {
    enqueueKeyboardEmitInternalBuffer(pReportBytes8);
  }
  return true;
}

bool usbIoCore_hidMouse_writeReport(uint8_t *pReportBytes3) {
  if (tud_hid_n_ready(ITF_MOUSE)) {
    tud_hid_n_report(ITF_MOUSE, 0, pReportBytes3, 3);
  } else {
    // enqueueMouseEmitInternalBuffer(pReportBytes3);
  }
  return true;
}

bool usbIoCore_genericHid_writeData(uint8_t *pDataBytes64) {
  if (tud_hid_n_ready(ITF_RAWHID)) {
    tud_hid_n_report(ITF_RAWHID, 0, pDataBytes64, 64);
  } else {
    enqueueRawHidEmitInternalBuffer(pDataBytes64);
  }
  return true;
}

bool usbIoCore_genericHid_readDataIfExists(uint8_t *pDataBytes64) {
  if (rawHidReceivedPageCount > 0) {
    memcpy(pDataBytes64, rawHidReceivedBuf, 64);
    rawHidReceivedPageCount--;
    return true;
  }
  return false;
}

uint8_t *usbioCore_getSerialNumberTextBufferPointer() {
  return (uint8_t *)altSerialNumberTextBuf;
}

bool usbIoCore_isConnectedToHost() {
  return isConnected;
}

void usbIoCore_processUpdate() {
  tud_task();
}

void usbIoCore_deInit() {
  // tusb_teardown();
}