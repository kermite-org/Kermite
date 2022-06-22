import { IRealtimeKeyboardEvent, IResourceOrigin } from '~/shared';
import { bytesToString } from '~/shell/services/keyboardDevice/Helpers';
import { RawHidOpcode } from '~/shell/services/keyboardDevice/RawHidOpcode';

export type IDeviceAttributesReadResponseData = {
  firmwareVariationName: string;
  projectReleaseBuildRevision: number;
  configStorageFormatRevision: number;
  configParametersRevision: number;
  profileBinaryFormatRevision: number;
  rawHidMessageProtocolRevision: number;
  resourceOrigin: IResourceOrigin;
  projectId: string;
  variationId: string;
  firmwareId: string;
  deviceInstanceCode: string;
  assignStorageCapacity: number;
  kermiteMcuCode: string;
};

export type ICustomParametersReadResponseData = {
  numParameters: number;
  parameterExposedFlags: number;
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
      type: 'customParametersReadResponse';
      data: ICustomParametersReadResponseData;
    }
  | {
      type: 'parameterChangedNotification';
      parameterIndex: number;
      value: number;
    };

export function receivedBytesDecoder(
  buf: Uint8Array,
): IReceivedBytesDecodeResult | undefined {
  const cmd = buf[0];
  // console.log(`received cmd:0x${cmd.toString(16)}`);
  if (cmd === RawHidOpcode.DeviceAttributesResponse) {
    const rawHidMessageProtocolRevision = buf[1];
    const configStorageFormatRevision = buf[2];
    const profileBinaryFormatRevision = buf[3];
    const configParametersRevision = buf[4];
    const kermiteMcuCode = bytesToString([...buf.slice(5, 8)]);
    const projectId = bytesToString([...buf.slice(8, 14)]);
    const firmwareId = bytesToString([...buf.slice(15, 21)]);
    const isProjectOriginOnline = !!buf[21];
    const projectReleaseBuildRevision = (buf[22] << 8) | buf[23];
    const firmwareVariationName = bytesToString([...buf.slice(24, 40)]);
    const deviceInstanceCode = bytesToString([...buf.slice(40, 44)]);
    const variationId = bytesToString([...buf.slice(44, 46)]);
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
        deviceInstanceCode,
        assignStorageCapacity,
        kermiteMcuCode,
        projectId,
        variationId,
        firmwareId,
      },
    };
  }

  if (cmd === RawHidOpcode.ParametersReadAllResponse) {
    const sz = buf[1];
    const parameterExposedFlags = (buf[2] << 8) | buf[3];
    const parameterValues = [...buf.slice(4, 4 + sz)];
    const parameterMaxValues = [...buf.slice(4 + sz, 4 + sz + sz)];
    return {
      type: 'customParametersReadResponse',
      data: {
        numParameters: sz,
        parameterExposedFlags,
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
