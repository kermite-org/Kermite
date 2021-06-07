export const enum DfuRequestType {
  Send = 0x21,
  Receive = 0xa1,
}

export const enum DfuRequest {
  Detach = 0,
  Dnload = 1,
  Upload = 2,
  GetStatus = 3,
  ClrStatus = 4,
  GetState = 5,
  Abort = 6,
}

export const enum DfuStatus {
  Ok = 0x00,
  errTarget = 0x01,
  errFile = 0x02,
  errWrite = 0x03,
  errErase = 0x04,
  errCheckErased = 0x05,
  errProg = 0x06,
  errVerify = 0x07,
  errAddress = 0x08,
  errNotDone = 0x09,
  errFirmware = 0x0a,
  errVendor = 0x0b,
  errUsbr = 0x0c,
  errPor = 0x0d,
  errUnknown = 0x0e,
  errStalledPkt = 0x0f,
}

export const enum DfuState {
  AppIdle = 0,
  AppDetach = 1,
  DfuIdle = 2,
  DfuDnloadSync = 3,
  DfuDnBusy = 4,
  DfuDnloadIdle = 5,
  DfuManifestSync = 6,
  DfuManifest = 7,
  DfuManifestWaitRest = 8,
  DfuUploadIdle = 9,
  DfuError = 10,
}
