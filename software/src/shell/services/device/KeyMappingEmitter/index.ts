import { IProfileData, IKeyboardLayoutStandard, delayMs } from '~/shared';
import { makeKeyAssignsConfigStorageData } from '~/shell/services/keyboardLogic/InputLogicSimulatorD/ProfileDataBinaryPacker';
import { KeyboardDeviceService } from '../KeyboardDevice';
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
    deviceService: KeyboardDeviceService,
  ): Promise<void> {
    const ds = deviceService;

    if (!ds.isOpen) {
      console.log(`device is not connected`);
      return;
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
      ds.writeSingleFrame(memoryWriteTransactionStartFrame);
      delayMs(50);
      await ds.writeFrames(keyAssingnDataFrames);

      ds.writeSingleFrame(checksumRequestFrame);
      delayMs(50);
      ds.writeSingleFrame(memoryWriteTransactionEndFrame);
      console.log('write done');
    } catch (err) {
      console.log(err);
    }
  }
}
