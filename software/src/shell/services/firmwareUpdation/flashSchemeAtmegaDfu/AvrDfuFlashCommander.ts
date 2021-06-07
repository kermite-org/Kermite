import * as usb from 'usb';
import { CommandLogger } from '~/shell/services/firmwareUpdation/flashSchemeAtMegaCaterina/CommandLogger';
import { readHexFileBytes } from '~/shell/services/firmwareUpdation/flashSchemeAtMegaCaterina/HexFileReader';
import { createAvrDfuOperationWrapper } from '~/shell/services/firmwareUpdation/flashSchemeAtmegaDfu/AvrDfuOperationWrapper';
import { createDfuDeviceFunctionWrapper } from '~/shell/services/firmwareUpdation/flashSchemeAtmegaDfu/DfuDeviceFunctionWrapper';

const logger = new CommandLogger();

async function flashFirmwareImpl(hexFilePath: string) {
  const firmwareBytes = readHexFileBytes(hexFilePath);
  logger.log(`loaded firmware size: ${firmwareBytes.length}`);

  const device = usb.findByIds(0x03eb, 0x2ff4); // ATmega32U4
  // console.log({ device });
  if (!device) {
    throw new Error(`target device not found, abort`);
  }

  const deviceFunctionWrapper = createDfuDeviceFunctionWrapper(device);
  const avrDfu = createAvrDfuOperationWrapper(deviceFunctionWrapper, logger);
  device.open();

  // await showStatus();
  const detail = await deviceFunctionWrapper.getDeviceDetail();
  logger.log(`connected device: ${detail.manufacturer} ${detail.product}`);

  await avrDfu.operateDfuAbort();
  await avrDfu.operateSelectFlashPageZero();
  await avrDfu.operateEraseFlashAll();
  await avrDfu.operateBlankCheckFlash();
  await avrDfu.operateDfuAbort();

  await avrDfu.workWriteFirmware(firmwareBytes);
  await avrDfu.operateDfuAbort();
  await avrDfu.operateExitDfuMode();

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
