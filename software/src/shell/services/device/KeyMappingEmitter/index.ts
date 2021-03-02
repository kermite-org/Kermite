import { delayMs, IKeyboardLayoutStandard, IProfileData } from '~/shared';
import { DeviceWrapper } from '~/shell/services/device/KeyboardDevice/DeviceWrapper';
import { makeKeyAssignsConfigStorageData } from '~/shell/services/keyboardLogic/InputLogicSimulatorD/ProfileDataBinaryPacker';
import { calcChecksum } from './Helpers';
import {
  makeMemoryChecksumRequestFrame,
  makeMemoryWriteOperationFrames,
  memoryWriteTransactionEndFrame,
  memoryWriteTransactionStartFrame,
} from './MemoryOperationFrameBuilder';

export namespace KeyMappingEmitter {
  export async function emitKeyAssignsToDevice(
    editModel: IProfileData,
    layout: IKeyboardLayoutStandard,
    deviceWrapper: DeviceWrapper | undefined,
  ): Promise<boolean> {
    const device = deviceWrapper;

    if (!device) {
      console.log(`device is not connected`);
      return false;
    }
    console.log(emitKeyAssignsToDevice.name);

    const data = makeKeyAssignsConfigStorageData(editModel, layout);
    const checksum = calcChecksum(data);
    const dataLength = data.length;

    if (dataLength >= 1024) {
      throw new Error(`key mapping data too large, ${dataLength / 1024}`);
    }

    console.log(`len: ${dataLength}, checksum: ${checksum}`);

    const keyAssingnDataFrames = makeMemoryWriteOperationFrames(
      data,
      'keyMapping',
    );
    const checksumRequestFrame = makeMemoryChecksumRequestFrame(
      'keyMapping',
      0,
      dataLength,
    );

    try {
      console.log('writing...');
      device.writeSingleFrame(memoryWriteTransactionStartFrame);
      delayMs(50);
      await device.writeFrames(keyAssingnDataFrames);

      device.writeSingleFrame(checksumRequestFrame);
      delayMs(50);
      device.writeSingleFrame(memoryWriteTransactionEndFrame);
      console.log('write done');
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
