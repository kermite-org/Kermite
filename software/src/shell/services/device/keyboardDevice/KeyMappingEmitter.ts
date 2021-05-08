import { delayMs, IKeyboardLayoutStandard, IProfileData } from '~/shared';
import { IDeviceWrapper } from '~/shell/services/device/keyboardDevice/DeviceWrapper';
import { Packets } from '~/shell/services/device/keyboardDevice/Packets';
import { makeProfileBinaryData } from '~/shell/services/keyboardLogic/inputLogicSimulatorD/ProfileDataBinaryPacker';
import { calcChecksum } from './Helpers';

export namespace KeyMappingEmitter {
  export async function emitKeyAssignsToDevice(
    profileData: IProfileData,
    layout: IKeyboardLayoutStandard,
    device: IDeviceWrapper | undefined,
  ): Promise<boolean> {
    if (!device) {
      console.log(`device is not connected`);
      return false;
    }
    console.log(emitKeyAssignsToDevice.name);

    const data = makeProfileBinaryData(profileData, layout);
    const checksum = calcChecksum(data);
    const dataLength = data.length;

    if (dataLength >= 1024) {
      throw new Error(`key mapping data too large, ${dataLength / 1024}`);
    }

    console.log(`len: ${dataLength}, checksum: ${checksum}`);

    const keyAssingnDataFrames = Packets.makeMemoryWriteOperationFrames(
      data,
      'keyMapping',
    );
    const checksumRequestFrame = Packets.makeMemoryChecksumRequestFrame(
      'keyMapping',
      0,
      dataLength,
    );

    try {
      console.log('writing...');
      device.writeSingleFrame(Packets.memoryWriteTransactionStartFrame);
      delayMs(50);
      await device.writeFrames(keyAssingnDataFrames);

      device.writeSingleFrame(checksumRequestFrame);
      delayMs(50);
      device.writeSingleFrame(Packets.memoryWriteTransactionEndFrame);
      console.log('write done');
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
