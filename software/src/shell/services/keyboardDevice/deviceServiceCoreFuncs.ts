import {
  AppError,
  ConfigParametersRevision,
  ConfigStorageFormatRevision,
  delayMs,
  ProfileBinaryFormatRevision,
  RawHidMessageProtocolRevision,
} from '~/shared';
import { NumSystemParameters } from '~/shared/defs/commandDefinitions';
import { Packets } from '~/shell/services/keyboardDevice/packets';
import {
  ICustomParametersReadResponseData,
  IDeviceAttributesReadResponseData,
  IReceivedBytesDecodeResult,
  receivedBytesDecoder,
} from '~/shell/services/keyboardDevice/receivedBytesDecoder';
import { IDeviceWrapper } from './deviceWrapper';

function checkRevisionValue(
  label: string,
  firmwareValue: number,
  softwareValue: number,
) {
  if (firmwareValue !== softwareValue) {
    throw new AppError(
      'IncompatibleFirmwareVersion',
      {},
      {},
      `Incompatible ${label} (software:${softwareValue}, firmware:${firmwareValue})`,
    );
  }
}

function checkDeviceRevisions(data: {
  projectReleaseBuildRevision: number;
  configStorageFormatRevision: number;
  configParametersRevision: number;
  profileBinaryFormatRevision: number;
  rawHidMessageProtocolRevision: number;
}) {
  const {
    configStorageFormatRevision,
    configParametersRevision,
    profileBinaryFormatRevision,
    rawHidMessageProtocolRevision,
  } = data;
  checkRevisionValue(
    'config storage revision',
    configStorageFormatRevision,
    ConfigStorageFormatRevision,
  );
  checkRevisionValue(
    'config parameters revision',
    configParametersRevision,
    ConfigParametersRevision,
  );
  checkRevisionValue(
    'profile binary format revision',
    profileBinaryFormatRevision,
    ProfileBinaryFormatRevision,
  );
  checkRevisionValue(
    'message protocol revision',
    rawHidMessageProtocolRevision,
    RawHidMessageProtocolRevision,
  );
}

// function getDeviceInitialParameterValues(customDef: IProjectCustomDefinition) {
//   return generateNumberSequence(10).map((i) => {
//     const paramSpec = customDef.customParameterSpecs?.find(
//       (paramSpec) => paramSpec.slotIndex === i,
//     );
//     return paramSpec ? paramSpec.defaultValue : 1;
//     // 定義がないパラメタのデフォルト値は1とする。
//     // project.jsonでパラメタが定義されていない場合に基本的なオプションを設定値クリアで0にしてしまうと
//     // キーストローク出力/LED出力が無効化されてファームウェアが動作しているかどうかを判別できなくなるため
//   });
// }

async function queryDeviceOperation<T>(
  device: IDeviceWrapper,
  requestFrame: number[],
  handler: (decoded: IReceivedBytesDecodeResult) => T | undefined | false,
): Promise<T> {
  let result: T | undefined;
  const onData = (buf: Uint8Array) => {
    const decoded = receivedBytesDecoder(buf);
    if (decoded) {
      const res = handler(decoded);
      if (res) {
        result = res;
      }
    }
  };
  device.onData(onData);
  device.writeSingleFrame(requestFrame);

  let cnt = 0;
  // eslint-disable-next-line no-unmodified-loop-condition
  while (!result && cnt < 1000) {
    await delayMs(1);
    cnt++;
  }
  device.onData.remove(onData);
  if (!result) {
    throw new Error('device read data timeout');
  }
  return result;
}

async function readDeviceAttributes(
  device: IDeviceWrapper,
): Promise<IDeviceAttributesReadResponseData> {
  return await queryDeviceOperation(
    device,
    Packets.deviceAttributesRequestFrame,
    (res) => res.type === 'deviceAttributeResponse' && res.data,
  );
}

export async function readDeviceCustomParameters(
  device: IDeviceWrapper,
): Promise<ICustomParametersReadResponseData> {
  return await queryDeviceOperation(
    device,
    Packets.customParametersBulkReadRequestFrame,
    (res) => res.type === 'customParametersReadResponse' && res.data,
  );
}

// function writeDeviceCustomParameters(
//   device: IDeviceWrapper,
//   initialParameters: number[],
// ) {
//   device.writeSingleFrame(
//     Packets.makeCustomParametersBulkWriteOperationFrame(initialParameters),
//   );
// }

export async function deviceSetupTask(device: IDeviceWrapper): Promise<{
  attrsRes: IDeviceAttributesReadResponseData;
  customParamsRes: ICustomParametersReadResponseData;
}> {
  const attrsRes = await readDeviceAttributes(device);
  checkDeviceRevisions(attrsRes);
  const customParamsRes = await readDeviceCustomParameters(device);
  if (customParamsRes.numParameters !== NumSystemParameters) {
    throw new Error('system parameters count mismatch');
  }
  // console.log({ customParamsRes });
  // if (!customParamsRes.isParametersInitialized) {
  //   const customDef = await projectResourceProvider.getProjectCustomDefinition(
  //     attrsRes.resourceOrigin,
  //     attrsRes.projectId,
  //     attrsRes.firmwareVariationName,
  //   );
  //   if (!customDef) {
  //     // throw new Error('cannot find custom parameter definition');
  //     console.log('cannot find custom parameter definition');
  //     return {
  //       attrsRes,
  //       customParamsRes: undefined,
  //     };
  //   }
  //   console.log(`writing initial custom parameters`);
  //   const parameterValues = getDeviceInitialParameterValues(customDef);
  //   writeDeviceCustomParameters(device, parameterValues);
  //   customParamsRes = await readDeviceCustomParameters(device);
  //   if (!customParamsRes.isParametersInitialized) {
  //     throw new Error('failed to write initial custom parameters');
  //   }
  // }
  return {
    attrsRes,
    customParamsRes,
  };
}
