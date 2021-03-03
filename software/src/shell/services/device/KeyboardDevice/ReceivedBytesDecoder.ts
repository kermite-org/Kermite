import { IRealtimeKeyboardEvent } from '~/shared';
import { bytesToString } from '~/shell/services/device/KeyboardDevice/Helpers';

type IReceivedBytesDecodeResult =
  | {
      type: 'realtimeEvent';
      event: IRealtimeKeyboardEvent;
    }
  | {
      type: 'deviceAttributeResponse';
      data: {
        projectReleaseBuildRevision: number;
        configStorageFormatRevision: number;
        rawHidMessageProtocolRevision: number;
        projectId: string;
      };
    }
  | {
      type: 'custromParametersReadResponse';
      data: {
        isParametersInitialized: boolean;
        parameterValues: number[];
      };
    };

export function recievedBytesDecoder(
  buf: Uint8Array,
): IReceivedBytesDecodeResult | undefined {
  if (buf[0] === 0xf0 && buf[1] === 0x11) {
    const projectReleaseBuildRevision = (buf[2] << 8) | buf[3];
    const configStorageFormatRevision = buf[4];
    const rawHidMessageProtocolRevision = buf[5];
    // const keyIndexRange = buf[6];
    // const side = buf[7];
    const projectId = bytesToString([...buf].slice(8, 16));
    return {
      type: 'deviceAttributeResponse',
      data: {
        projectReleaseBuildRevision,
        configStorageFormatRevision,
        rawHidMessageProtocolRevision,
        projectId,
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
