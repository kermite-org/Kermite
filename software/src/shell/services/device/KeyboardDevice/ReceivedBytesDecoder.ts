import { IRealtimeKeyboardEvent, IResourceOrigin } from '~/shared';
import { getMcuNameFromKermiteMcuCode } from '~/shared/funcs/DomainRelatedHelpers';
import { bytesToString } from '~/shell/services/device/KeyboardDevice/Helpers';

export type IDeviceAttributesReadResponseData = {
  firmwareVariationName: string;
  projectReleaseBuildRevision: number;
  configStorageFormatRevision: number;
  rawHidMessageProtocolRevision: number;
  resourceOrigin: IResourceOrigin;
  projectId: string;
  deviceInstanceCode: string;
  assignStorageCapacity: number;
  firmwareMcuName: string;
};

export type ICustomParametersReadResponseData = {
  isParametersInitialized: boolean;
  parameterValues: number[];
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
    };

export function recievedBytesDecoder(
  buf: Uint8Array,
): IReceivedBytesDecodeResult | undefined {
  if (buf[0] === 0xf0 && buf[1] === 0x11) {
    const projectReleaseBuildRevision = (buf[2] << 8) | buf[3];
    const configStorageFormatRevision = buf[4];
    const rawHidMessageProtocolRevision = buf[5];
    const projectId = bytesToString([...buf].slice(6, 14));
    const isProjectOriginOnline = !!buf[14];
    const deviceInstanceCode = bytesToString([...buf].slice(16, 24));
    const assignStorageCapacity = (buf[24] << 8) | buf[25];
    const firmwareVariationName = bytesToString([...buf].slice(26, 42));
    const kermiteMcuCode = bytesToString([...buf].slice(42, 50));
    return {
      type: 'deviceAttributeResponse',
      data: {
        firmwareVariationName,
        projectReleaseBuildRevision,
        configStorageFormatRevision,
        rawHidMessageProtocolRevision,
        resourceOrigin: isProjectOriginOnline ? 'online' : 'local',
        projectId,
        deviceInstanceCode,
        assignStorageCapacity,
        firmwareMcuName: getMcuNameFromKermiteMcuCode(kermiteMcuCode),
      },
    };
  }

  if (buf[0] === 0xb0 && buf[1] === 0x02 && buf[2] === 0x81) {
    const isParametersInitialized = !!buf[3];
    const parameterValues = [...buf.slice(4, 14)];
    return {
      type: 'custromParametersReadResponse',
      data: {
        isParametersInitialized,
        parameterValues,
      },
    };
  }

  if (buf[0] === 0xe0 && buf[1] === 0x90) {
    const keyIndex = buf[2];
    const isDown = buf[3] !== 0;
    return {
      type: 'realtimeEvent',
      event: {
        type: 'keyStateChanged',
        keyIndex: keyIndex,
        isDown,
      },
    };
  }

  if (buf[0] === 0xe0 && buf[1] === 0x91) {
    const layerActiveFlags = (buf[2] << 8) | buf[3];
    return {
      type: 'realtimeEvent',
      event: {
        type: 'layerChanged',
        layerActiveFlags,
      },
    };
  }

  if (buf[0] === 0xe0 && buf[1] === 0x92) {
    const assignHitResultWord = (buf[2] << 8) | buf[3];
    const keyIndex = assignHitResultWord & 0xff;
    const layerIndex = (assignHitResultWord >> 8) & 0x0f;
    const prioritySpec = (assignHitResultWord >> 12) & 0x03;
    // console.log(`assign hit @ device ${keyIndex} ${layerIndex}`);
    return {
      type: 'realtimeEvent',
      event: {
        type: 'assignHit',
        layerIndex,
        keyIndex,
        prioritySpec,
      },
    };
  }

  return undefined;
}
