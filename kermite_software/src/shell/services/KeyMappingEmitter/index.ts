import { IKeyboardLayoutStandard } from '~defs/ConfigTypes';
import { IProfileData } from '~defs/ProfileData';
import { delayMs } from '~funcs/Utils';
import { deviceService } from '~shell/services/KeyboardDevice';
import { makeKeyAssignsConfigStorageData } from '~shell/services/KeyboardLogic/InputLogicSimulatorD/ProfileDataBinaryPacker';
import { calcChecksum } from './Helpers';
import {
  makeMemoryChecksumRequestFrame,
  makeMemoryWriteOperationFrames,
  memoryWriteTransactionEndFrame,
  memoryWriteTransactionStartFrame
} from './MemoryOperationFrameBuilder';

export namespace KeyMappingEmitter {
  export function emitKeyAssignsToDevice(
    editModel: IProfileData,
    layout: IKeyboardLayoutStandard
  ) {
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
      'keyMapping'
    );
    const checksumRequestFrame = makeMemoryChecksumRequestFrame(
      'keyMapping',
      0,
      dataLength
    );

    (async () => {
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
    })();
  }
}
