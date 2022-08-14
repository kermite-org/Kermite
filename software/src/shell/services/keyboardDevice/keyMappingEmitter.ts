import { delayMs, IProfileData } from '~/shared';
import { IDeviceWrapper } from '~/shell/services/keyboardDevice/deviceWrapper';
import { Packets } from '~/shell/services/keyboardDevice/packets';
import { makeProfileBinaryData } from '~/shell/services/keyboardLogic/profileDataBinaryPacker';
import { calcChecksum } from './helpers';

export namespace KeyMappingEmitter {
  export async function emitKeyAssignsToDevice(
    profileData: IProfileData,
    device: IDeviceWrapper,
    assignStorageCapacity: number,
  ): Promise<void> {
    console.log(emitKeyAssignsToDevice.name);

    const data = makeProfileBinaryData(profileData);
    const checksum = calcChecksum(data);
    const dataLength = data.length;

    if (dataLength >= assignStorageCapacity) {
      throw new Error(
        `key mapping data too large, ${dataLength} / ${assignStorageCapacity}`,
      );
    }

    console.log(`len: ${dataLength}, checksum: ${checksum}`);

    const keyAssignDataFrames = Packets.makeMemoryWriteOperationFrames(data);
    const checksumRequestFrame = Packets.makeMemoryChecksumRequestFrame(
      0,
      dataLength,
    );

    console.log('writing...');
    device.writeSingleFrame(Packets.memoryWriteTransactionStartFrame);
    await delayMs(50);
    await device.writeFrames(keyAssignDataFrames);

    device.writeSingleFrame(checksumRequestFrame);
    await delayMs(50);
    device.writeSingleFrame(Packets.memoryWriteTransactionEndFrame);
    console.log('write done');
  }
}
