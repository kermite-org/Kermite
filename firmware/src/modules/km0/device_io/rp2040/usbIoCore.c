//based on tinyusb multiple interfaces example

#include "usbIoCore.h"
#include "config.h"
#include "tusb.h"

//--------------------------------------------------------------------
// Definitions

#ifndef KM0_USB_VENDOR_ID
#define KM0_USB_VENDOR_ID 0xF055
#endif

#ifndef KM0_USB_PRODUCT_ID
#define KM0_USB_PRODUCT_ID 0xA579
#endif

#ifndef KM0_USB_MANUFACTURER_TEXT
#define KM0_USB_MANUFACTURER_TEXT "Kermite"
#endif

#ifndef KM0_USB_PRODUCT_TEXT
#define KM0_USB_PRODUCT_TEXT "Kermite Keyboard Device"
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

  .idVendor = KM0_USB_VENDOR_ID,
  .idProduct = KM0_USB_PRODUCT_ID,
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

static uint8_t const desc_hid_report_keyboard[] = {
  TUD_HID_REPORT_DESC_KEYBOARD()
};

static uint8_t const desc_hid_report_mouse[] = {
  TUD_HID_REPORT_DESC_MOUSE()
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
  TUD_HID_DESCRIPTOR(ITF_KEYBOARD, 0, HID_PROTOCOL_NONE, sizeof(desc_hid_report_keyboard), EPNUM_HID_MOUSE, CFG_TUD_HID_EP_BUFSIZE, 10),
  TUD_HID_DESCRIPTOR(ITF_MOUSE, 0, HID_PROTOCOL_NONE, sizeof(desc_hid_report_mouse), EPNUM_HID_KEYBOARD, CFG_TUD_HID_EP_BUFSIZE, 10),
  // Interface number, string index, protocol, report descriptor len, EP In & Out address, size & polling interval
  TUD_HID_INOUT_DESCRIPTOR(ITF_RAWHID, 0, HID_PROTOCOL_NONE, sizeof(desc_hid_report_rawhid), EPNUM_HID_RAWHID,
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
  KM0_USB_MANUFACTURER_TEXT,    // 1: Manufacturer
  KM0_USB_PRODUCT_TEXT,         // 2: Product
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
// exports

void usbIoCore_initialize() {
  tusb_init();
}

bool usbIoCore_hidKeyboard_writeReport(uint8_t *pReportBytes8) {
  if (tud_hid_n_ready(ITF_KEYBOARD)) {
    uint8_t *p = pReportBytes8;
    tud_hid_n_keyboard_report(ITF_KEYBOARD, p[0], p[1], p + 2);
  }
  return true;
}

bool usbIoCore_genericHid_writeData(uint8_t *pDataBytes64) {
  tud_hid_n_report(ITF_RAWHID, 0, pDataBytes64, 64);
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

void uibioCore_internal_setSerialNumberText(uint8_t *pTextBuf, uint8_t len) {
  if (len > 24) {
    len = 24;
  }
  memcpy(altSerialNumberTextBuf, pTextBuf, len);
  altSerialNumberTextBuf[len] = '\0';
}

bool usbIoCore_isConnectedToHost() {
  return isConnected;
}

void usbIoCore_processUpdate() {
  tud_task();
}