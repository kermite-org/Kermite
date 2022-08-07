// based on tinyusb multiple interfaces example

#include "km0/base/configImport.h"
#include "km0/base/utils.h"
#include "km0/device/usbIoCore.h"
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

enum {
  ITF_NUM_HID_SHARED = 0,
  ITF_NUM_RAWHID,
  ITF_NUM_TOTAL,
};

enum {
  REPORT_ID_KEYBOARD = 1,
  REPORT_ID_MOUSE,
};

volatile static bool isConnected = false;

static uint8_t keyboardLedStatus = 0;

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

static uint8_t const desc_hid_report_shared[] = {
  TUD_HID_REPORT_DESC_KEYBOARD(HID_REPORT_ID(REPORT_ID_KEYBOARD)),
  TUD_HID_REPORT_DESC_MOUSE(HID_REPORT_ID(REPORT_ID_MOUSE))
};

// static uint8_t const desc_hid_report_mouse[] = {
//   TUD_HID_REPORT_DESC_MOUSE()
// };

static uint8_t const desc_hid_report_rawhid[] = {
  TUD_HID_REPORT_DESC_GENERIC_INOUT(CFG_TUD_HID_EP_BUFSIZE)
};

uint8_t const *tud_hid_descriptor_report_cb(uint8_t itf) {
  if (itf == ITF_NUM_HID_SHARED) {
    return desc_hid_report_shared;
  } else if (itf == ITF_NUM_RAWHID) {
    return desc_hid_report_rawhid;
  }
  return NULL;
}

//--------------------------------------------------------------------
// Configuration Descriptor

#define CONFIG_TOTAL_LEN (TUD_CONFIG_DESC_LEN + TUD_HID_DESC_LEN + TUD_HID_INOUT_DESC_LEN)
// #define CONFIG_TOTAL_LEN (TUD_CONFIG_DESC_LEN + TUD_HID_INOUT_DESC_LEN + TUD_HID_DESC_LEN + TUD_HID_INOUT_DESC_LEN)

// #define EPNUM_HID_MOUSE 0x01
#define EPNUM_HID_SHARED 0x01
#define EPNUM_HID_RAWHID 0x02

static uint8_t const desc_configuration[] = {
  // Config number, interface count, string index, total length, attribute, power in mA
  TUD_CONFIG_DESCRIPTOR(1, ITF_NUM_TOTAL, 0, CONFIG_TOTAL_LEN, TUSB_DESC_CONFIG_ATT_REMOTE_WAKEUP, 100),

  // Interface number, string index, protocol, report descriptor len, EP In & Out address, size & polling interval
  TUD_HID_DESCRIPTOR(ITF_NUM_HID_SHARED, 0, HID_ITF_PROTOCOL_NONE, sizeof(desc_hid_report_shared),
                     0x80 | EPNUM_HID_SHARED, CFG_TUD_HID_EP_BUFSIZE, 5),

  // TUD_HID_DESCRIPTOR(ITF_MOUSE, 0, HID_ITF_PROTOCOL_NONE, sizeof(desc_hid_report_mouse),
  //                    0x80 | EPNUM_HID_MOUSE, CFG_TUD_HID_EP_BUFSIZE, 10),

  // Interface number, string index, protocol, report descriptor len, EP In & Out address, size & polling interval
  TUD_HID_INOUT_DESCRIPTOR(ITF_NUM_RAWHID, 0, HID_ITF_PROTOCOL_NONE, sizeof(desc_hid_report_rawhid),
                           EPNUM_HID_RAWHID, 0x80 | EPNUM_HID_RAWHID, CFG_TUD_HID_EP_BUFSIZE, 5)

};

uint8_t const *tud_descriptor_configuration_cb(uint8_t index) {
  return desc_configuration;
}

//--------------------------------------------------------------------
// String Descriptors

static char altProductNameTextBuf[] = "00000000000000000000000000000000";
static char altSerialNumberTextBuf[] = "00000000000000000000000000000000000000";

// array of pointer to string descriptors
static char const *string_desc_arr[] = {
  (const char[]){ 0x09, 0x04 }, // 0: is supported language is English (0x0409)
  KM0_USB__MANUFACTURER_TEXT,   // 1: Manufacturer
  altProductNameTextBuf,        // 2: Product
  altSerialNumberTextBuf,       // 3: Serials, should use chip ID
};

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

// TOOD: 必要なら多面バッファを構成
static uint8_t rawHidReceivedBuf[64];
static uint32_t rawHidReceivedPageCount = 0;

// Invoked when received SET_REPORT control request
// or received data on OUT endpoint ( Report ID = 0, Type = 0 )
void tud_hid_set_report_cb(uint8_t itf, uint8_t report_id, hid_report_type_t report_type, uint8_t const *buffer, uint16_t bufsize) {
  // printf("set report %d %d %d, %d bytes\n", itf, report_id, report_type, bufsize);

  if (itf == ITF_NUM_HID_SHARED && bufsize == 1) {
    keyboardLedStatus = buffer[0];
  }
  if (itf == ITF_NUM_RAWHID) {
    memcpy(rawHidReceivedBuf, buffer, bufsize);
    rawHidReceivedPageCount++;
  }
}

//--------------------------------------------------------------------

// RawHIDのフレームを複数続けて送りたい場合に、後続のフレームが書き込めず失われるため
//多面バッファを使用して送信する
// TODO: 無駄が多いので、複数のリアルタイムイベントを1つのフレームに詰めて送る実装にしたい

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
    if (tud_hid_n_ready(ITF_NUM_RAWHID)) {
      tud_hid_n_report(ITF_NUM_RAWHID, 0, rawhid_txbuf[rawhid_txbuf_ri], 64);
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
    if (tud_hid_n_ready(ITF_NUM_HID_SHARED)) {
      tud_hid_n_report(ITF_NUM_HID_SHARED, REPORT_ID_KEYBOARD, keboard_txbuf[keboard_txbuf_ri], 8);
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
  if (itf == ITF_NUM_HID_SHARED) {
    shiftOutKeyboardEmitInternalBuffer();
  } else if (itf == ITF_NUM_RAWHID) {
    shiftOutRawHidEmitInternalBuffer();
  }
}

//--------------------------------------------------------------------
// exports

void usbIoCore_initialize() {
  tusb_init();
}

bool usbIoCore_hidKeyboard_writeReport(uint8_t *pReportBytes8) {
  if (tud_hid_n_ready(ITF_NUM_HID_SHARED)) {
    tud_hid_n_report(ITF_NUM_HID_SHARED, REPORT_ID_KEYBOARD, pReportBytes8, 8);
  } else {
    enqueueKeyboardEmitInternalBuffer(pReportBytes8);
  }
  return true;
}

bool usbIoCore_hidMouse_writeReport(uint8_t *pReportBytes3) {
  if (tud_hid_n_ready(ITF_NUM_HID_SHARED)) {
    tud_hid_n_report(ITF_NUM_HID_SHARED, REPORT_ID_MOUSE, pReportBytes3, 7);
  } else {
    // enqueueMouseEmitInternalBuffer(pReportBytes3);
  }
  return true;
}

uint8_t usbIoCore_hidKeyboard_getStatusLedFlags() {
  return keyboardLedStatus;
}

bool usbIoCore_genericHid_writeData(uint8_t *pDataBytes64) {
  if (tud_hid_n_ready(ITF_NUM_RAWHID)) {
    tud_hid_n_report(ITF_NUM_RAWHID, 0, pDataBytes64, 64);
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

char *usbIoCore_getSerialNumberTextBufferPointer() {
  return altSerialNumberTextBuf;
}

void usbIoCore_setProductName(char *productName) {
  strcpy(altProductNameTextBuf, productName);
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