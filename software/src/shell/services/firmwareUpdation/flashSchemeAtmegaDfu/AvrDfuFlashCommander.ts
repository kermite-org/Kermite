/* eslint-disable @typescript-eslint/no-unused-vars */
import * as usb from 'usb';
import { CommandLogger } from '~/shell/services/firmwareUpdation/flashSchemeAtMegaCaterina/CommandLogger';
import { readHexFileBytes } from '~/shell/services/firmwareUpdation/flashSchemeAtMegaCaterina/HexFileReader';
import {
  bufferPadZerosTo,
  hex4,
  bhi,
  blo,
  splitBytesN,
} from '~/shell/services/firmwareUpdation/flashSchemeAtMegaCaterina/helpers';

const logger = new CommandLogger();

const enum DfuRequestType {
  Send = 0x21,
  Receive = 0xa1,
}

const enum DfuRequest {
  Detach = 0,
  Dnload = 1,
  Upload = 2,
  GetStatus = 3,
  ClrStatus = 4,
  GetState = 5,
  Abort = 6,
}

const enum DfuStatus {
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

const enum DfuState {
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

const enum AvrDfuCommand {
  ProgStart = 1,
  DisplayData = 3,
  Write = 4,
  Read = 5,
  ChangeBaseAddress = 6,
}

function usbPromisify<A extends any[], D>(
  func: (...args: [...A, (err: any, data: D) => void]) => void,
): (...args: A) => Promise<D> {
  return (...args: A) => {
    return new Promise((resolve, reject) => {
      func(...args, (err: any, data: D) => {
        if (!err) {
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };
}

const isWindows = process.platform === 'win32';

async function flashFirmwareImpl(hexFilePath: string) {
  const firmwareBytes = readHexFileBytes(hexFilePath);
  logger.log(`loaded firmware size: ${firmwareBytes.length}`);

  const device = usb.findByIds(0x03eb, 0x2ff4); // ATmega32U4
  // console.log({ device });

  if (!device) {
    throw new Error(`target device not found, abort`);
  }

  const asyncGetStringDescriptor = usbPromisify(
    device.getStringDescriptor.bind(device),
  );

  const asyncControlTransfter = usbPromisify(
    device.controlTransfer.bind(device),
  );

  const wIndex = 4;

  async function requestWrite(
    bRequest: number,
    wValue: number,
    data: number[],
  ): Promise<void> {
    // console.log(`requestWrite ${bRequest} ${wValue}`);

    let modData = data;
    if (isWindows) {
      // Windowsで空のBufferをnode-usbに渡すとlibusbの内部で例外が出るためこれを回避
      modData = data.length === 0 ? [0] : data;
    }
    const dataSend = Buffer.from(modData);
    // console.log(" ", { dataSend });
    await asyncControlTransfter(
      DfuRequestType.Send,
      bRequest,
      wValue,
      wIndex,
      dataSend,
    );
  }

  async function requestRead(
    bRequest: number,
    wValue: number,
    length: number,
  ): Promise<number[]> {
    // console.log(`requestRead ${bRequest} ${wValue} ${length}`);
    const buffer = (await asyncControlTransfter(
      DfuRequestType.Receive,
      bRequest,
      wValue,
      wIndex,
      length,
    ))!;
    // console.log(" ", { bufferReceived: buffer });
    return [...new Uint8Array(buffer)];
  }

  async function getStatus(): Promise<{ status: DfuStatus; state: DfuState }> {
    const bytes = await requestRead(DfuRequest.GetStatus, 0, 6);
    return {
      status: bytes[0] as DfuStatus,
      state: bytes[4] as DfuState,
    };
  }

  async function showStatus(): Promise<void> {
    const status = await getStatus();
    logger.log(`status: ${status.status}, state: ${status.state}`);
  }

  async function checkStatus() {
    const status = await getStatus();
    if (
      !(status.status === DfuStatus.Ok && status.state === DfuState.DfuIdle)
    ) {
      throw new Error(
        `invalid status status:${status.status} state:${status.state}`,
      );
    }
  }

  async function operateDfuAbort() {
    await requestWrite(DfuRequest.Abort, 0, []);
    await checkStatus();
  }

  async function operateEraseFlashAll() {
    logger.log(`erase`);
    await requestWrite(DfuRequest.Dnload, 0, [AvrDfuCommand.Write, 0x00, 0xff]);
    await checkStatus();
  }

  async function operateSelectFlashPageZero() {
    await requestWrite(DfuRequest.Dnload, 0, [
      AvrDfuCommand.ChangeBaseAddress,
      0x03,
      0x00,
      0x00,
    ]);
    await checkStatus();
  }

  async function operateBlankCheckFlash() {
    await requestWrite(DfuRequest.Dnload, 0, [
      AvrDfuCommand.DisplayData,
      0x01,
      0x00,
      0x00,
      0x6f,
      0xff,
    ]);
    await checkStatus();
  }

  async function operateExitDfuMode() {
    // start application
    await requestWrite(DfuRequest.Dnload, 0, [AvrDfuCommand.Write, 0x03, 0x00]);
    try {
      await requestWrite(DfuRequest.Dnload, 0, []);
    } catch (error) {}
  }

  async function operateReadFlash(
    addr: number,
    size: number,
  ): Promise<number[]> {
    await requestWrite(DfuRequest.Dnload, 0, [
      AvrDfuCommand.DisplayData,
      0x00, // read target: flash
      bhi(addr),
      blo(addr),
      bhi(addr + size - 1),
      blo(addr + size - 1),
    ]);
    await checkStatus();
    const bytes = await requestRead(DfuRequest.Upload, 0, size);
    await checkStatus();
    return bytes;
  }

  async function operateWriteBlock(
    startAddress: number,
    bytes: number[],
  ): Promise<void> {
    const endAddress = startAddress + bytes.length - 1;
    const headPart = bufferPadZerosTo(
      [
        AvrDfuCommand.ProgStart,
        0x00, // write target: flash
        bhi(startAddress),
        blo(startAddress),
        bhi(endAddress),
        blo(endAddress),
      ],
      32,
    );
    const tailPart = new Array(16).fill(0);
    const frame = [...headPart, ...bytes, ...tailPart];
    logger.log(
      `writing ${hex4(startAddress)}:${hex4(endAddress)} ${bytes.length} bytes`,
    );
    await requestWrite(DfuRequest.Dnload, 1, frame);
    await checkStatus();
  }

  async function workWriteFirmware(firmwareBytes: number[]) {
    const blockSize = 1024;
    const blocks = splitBytesN(firmwareBytes, blockSize);
    let pos = 0;
    for (const block of blocks) {
      await operateWriteBlock(pos, block);
      pos += block.length;
    }
  }

  device.open();

  // await showStatus();

  const manufacturerText = await asyncGetStringDescriptor(
    device.deviceDescriptor.iManufacturer,
  );
  const productText = await asyncGetStringDescriptor(
    device.deviceDescriptor.iProduct,
  );
  logger.log(`connected device: ${manufacturerText} ${productText}`);

  await operateDfuAbort();
  await operateSelectFlashPageZero();
  await operateEraseFlashAll();
  await operateBlankCheckFlash();
  await operateDfuAbort();

  await workWriteFirmware(firmwareBytes);
  await operateDfuAbort();
  await operateExitDfuMode();

  device.close();

  logger.log('write done.');
}

export async function avrDfuFlashCommander_flashFirmware(
  hexFilePath: string,
): Promise<'ok' | string> {
  logger.reset();
  try {
    logger.log(`#### start firmware upload`);
    await flashFirmwareImpl(hexFilePath);
    logger.log(`#### firmware upload complete`);
    return 'ok';
  } catch (err) {
    logger.log(`#### an error occured while writing firmware`);
    logger.log(`error: ${err.message}`);
    return logger.flush();
  }
}
