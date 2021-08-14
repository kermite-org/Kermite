import { IRealtimeKeyboardEvent, IResourceOrigin } from '~/shared';
import { getMcuNameFromKermiteMcuCode } from '~/shared/funcs/DomainRelatedHelpers';
import { bytesToString } from '~/shell/services/device/keyboardDevice/Helpers';
import { RawHidOpcode } from '~/shell/services/device/keyboardDevice/RawHidOpcode';

export type IDeviceAttributesReadResponseData = {
  firmwareVariationName: string;
  projectReleaseBuildRevision: number;
  configStorageFormatRevision: number;
  configParametersRevision: number;
  profileBinaryFormatRevision: number;
  rawHidMessageProtocolRevision: number;
  resourceOrigin: IResourceOrigin;
  firmwareId: string;
  deviceInstanceCode: string;
  assignStorageCapacity: number;
  firmwareMcuName: string;
};

export type ICustomParametersReadResponseData = {
  numParameters: number;
  parameterValues: number[];
  parameterMaxValues: number[];
};

export type IReceivedBytesDecodeResult =
  | {
      type: 'realtimeEvent';
      event: IRealtimeKeyboardEvent;
    }
  | {
      type: 'deviceAttributeResponse';
      data: IDeviceAttributesReadResponseData;
    }
  | {
      type: 'custromParametersReadResponse';
      data: ICustomParametersReadResponseData;
    }
  | {
      type: 'parameterChangedNotification';
      parameterIndex: number;
      value: number;
    };

export function recievedBytesDecoder(
  buf: Uint8Array,
): IReceivedBytesDecodeResult | undefined {
  const cmd = buf[0];
  // console.log(`received cmd:0x${cmd.toString(16)}`);
  if (cmd === RawHidOpcode.DeviceAttributesResponse) {
    const rawHidMessageProtocolRevision = buf[1];
    const configStorageFormatRevision = buf[2];
    const profileBinaryFormatRevision = buf[3];
    const configParametersRevision = buf[4];
    const kermiteMcuCode = bytesToString([...buf].slice(5, 15));
    const firmwareId = bytesToString([...buf].slice(15, 21));
    const isProjectOriginOnline = !!buf[21];
    const projectReleaseBuildRevision = (buf[22] << 8) | buf[23];
    const firmwareVariationName = bytesToString([...buf].slice(24, 40));
    const deviceInstanceCode = bytesToString([...buf].slice(40, 48));
    const assignStorageCapacity = (buf[48] << 8) | buf[49];
    return {
      type: 'deviceAttributeResponse',
      data: {
        firmwareVariationName,
        projectReleaseBuildRevision,
        configStorageFormatRevision,
        configParametersRevision,
        profileBinaryFormatRevision,
        rawHidMessageProtocolRevision,
        resourceOrigin: isProjectOriginOnline ? 'online' : 'local',
        firmwareId,
        deviceInstanceCode,
        assignStorageCapacity,
        firmwareMcuName: getMcuNameFromKermiteMcuCode(kermiteMcuCode),
      },
    };
  }

  if (cmd === RawHidOpcode.ParametersReadAllResponse) {
    const sz = buf[1];
    const parameterValues = [...buf.slice(2, 2 + sz)];
    const parameterMaxValues = [...buf.slice(2 + sz, 2 + sz + sz)];
    return {
      type: 'custromParametersReadResponse',
      data: {
        numParameters: sz,
        parameterValues,
        parameterMaxValues,
      },
    };
  }

  if (cmd === RawHidOpcode.ParameterChangedNotification) {
    const parameterIndex = buf[1];
    const value = buf[2];
    return {
      type: 'parameterChangedNotification',
      parameterIndex,
      value,
    };
  }

  if (cmd === RawHidOpcode.RealtimeKeyStateEvent) {
    const keyIndex = buf[1];
    const isDown = buf[2] !== 0;
    return {
      type: 'realtimeEvent',
      event: {
        type: 'keyStateChanged',
        keyIndex: keyIndex,
        isDown,
      },
    };
  }

  if (cmd === RawHidOpcode.RealtimeLayerStateEvent) {
    const layerActiveFlags = (buf[1] << 8) | buf[2];
    return {
      type: 'realtimeEvent',
      event: {
        type: 'layerChanged',
        layerActiveFlags,
      },
    };
  }
  return undefined;
}
