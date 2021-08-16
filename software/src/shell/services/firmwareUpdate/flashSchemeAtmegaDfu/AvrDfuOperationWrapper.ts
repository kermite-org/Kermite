/* eslint-disable @typescript-eslint/no-unused-vars */
import { splitBytesN } from '~/shared';
import { CommandLogger } from '~/shell/services/firmwareUpdate/flashSchemeAtMegaCaterina/CommandLogger';
import {
  bhi,
  blo,
  bufferPadZerosTo,
  hex4,
} from '~/shell/services/firmwareUpdate/flashSchemeAtMegaCaterina/helpers';
import {
  DfuRequest,
  DfuState,
  DfuStatus,
} from '~/shell/services/firmwareUpdate/flashSchemeAtmegaDfu/DfuConstants';
import { IDfuDeviceFunctionWrapper } from '~/shell/services/firmwareUpdate/flashSchemeAtmegaDfu/DfuDeviceFunctionWrapper';

const enum AvrDfuCommand {
  ProgStart = 1,
  DisplayData = 3,
  Write = 4,
  Read = 5,
  ChangeBaseAddress = 6,
}

interface IAvrDfuOperationWrapper {
  showStatus(): Promise<void>;
  operateDfuAbort(): Promise<void>;
  operateEraseFlashAll(): Promise<void>;
  operateSelectFlashPageZero(): Promise<void>;
  operateBlankCheckFlash(): Promise<void>;
  operateExitDfuMode(): Promise<void>;
  workWriteFirmware(firmwareBytes: number[]): Promise<void>;
}

export function createAvrDfuOperationWrapper(
  dw: IDfuDeviceFunctionWrapper,
  logger: CommandLogger,
): IAvrDfuOperationWrapper {
  const itfIndex = 4;

  async function getStatus(): Promise<{ status: DfuStatus; state: DfuState }> {
    const bytes = await dw.requestRead(DfuRequest.GetStatus, 0, itfIndex, 6);
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
    await dw.requestWrite(DfuRequest.Abort, 0, itfIndex, []);
    await checkStatus();
  }

  async function operateEraseFlashAll() {
    logger.log(`erase`);
    await dw.requestWrite(DfuRequest.Dnload, 0, itfIndex, [
      AvrDfuCommand.Write,
      0x00,
      0xff,
    ]);
    await checkStatus();
  }

  async function operateSelectFlashPageZero() {
    await dw.requestWrite(DfuRequest.Dnload, 0, itfIndex, [
      AvrDfuCommand.ChangeBaseAddress,
      0x03,
      0x00,
      0x00,
    ]);
    await checkStatus();
  }

  async function operateBlankCheckFlash() {
    await dw.requestWrite(DfuRequest.Dnload, 0, itfIndex, [
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
    await dw.requestWrite(DfuRequest.Dnload, 0, itfIndex, [
      AvrDfuCommand.Write,
      0x03,
      0x00,
    ]);
    try {
      await dw.requestWrite(DfuRequest.Dnload, 0, itfIndex, []);
    } catch (error) {}
  }

  async function operateReadFlash(
    addr: number,
    size: number,
  ): Promise<number[]> {
    await dw.requestWrite(DfuRequest.Dnload, 0, itfIndex, [
      AvrDfuCommand.DisplayData,
      0x00, // read target: flash
      bhi(addr),
      blo(addr),
      bhi(addr + size - 1),
      blo(addr + size - 1),
    ]);
    await checkStatus();
    const bytes = await dw.requestRead(DfuRequest.Upload, 0, itfIndex, size);
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
    await dw.requestWrite(DfuRequest.Dnload, 1, itfIndex, frame);
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

  return {
    showStatus,
    operateDfuAbort,
    operateEraseFlashAll,
    operateSelectFlashPageZero,
    operateBlankCheckFlash,
    operateExitDfuMode,
    workWriteFirmware,
  };
}
