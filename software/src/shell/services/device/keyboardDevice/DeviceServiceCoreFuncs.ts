import {
  ConfigParametersRevision,
  ConfigStorageFormatRevision,
  delayMs,
  ProfileBinaryFormatRevision,
  RawHidMessageProtocolRevision,
} from '~/shared';
import { NumSystemParameters } from '~/shared/defs/CommandDefinitions';
import {
  checkDeviceInstanceCodeFormat,
  generateRandomDeviceInstanceCode,
} from '~/shared/funcs/DomainRelatedHelpers';
import { Packets } from '~/shell/services/device/keyboardDevice/Packets';
import {
  ICustomParametersReadResponseData,
  IDeviceAttributesReadResponseData,
  IReceivedBytesDecodeResult,
  recievedBytesDecoder,
} from '~/shell/services/device/keyboardDevice/ReceivedBytesDecoder';
import { IDeviceWrapper } from './DeviceWrapper';

function checkRevisionValue(
  label: string,
  firmwareValue: number,
  softwareValue: number,
) {
  if (firmwareValue !== softwareValue) {
    throw new Error(
      `incompatible ${label} (software:${softwareValue}, firmware:${firmwareValue})`,
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
    const decoded = recievedBytesDecoder(buf);
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

async function readDeviceCustomParameters(
  device: IDeviceWrapper,
): Promise<ICustomParametersReadResponseData> {
  return await queryDeviceOperation(
    device,
    Packets.customParametersBulkReadRequestFrame,
    (res) => res.type === 'custromParametersReadResponse' && res.data,
  );
}

function writeDeviceInstanceCode(device: IDeviceWrapper, code: string) {
  device.writeSingleFrame(
    Packets.makeDeviceInstanceCodeWriteOperationFrame(code),
  );
}

// function writeDeviceCustromParameters(
//   device: IDeviceWrapper,
//   initialParameters: number[],
// ) {
//   device.writeSingleFrame(
//     Packets.makeCustomParametersBulkWriteOperationFrame(initialParameters),
//   );
// }

export async function deviceSetupTask(
  device: IDeviceWrapper,
): Promise<{
  attrsRes: IDeviceAttributesReadResponseData;
  customParamsRes: ICustomParametersReadResponseData | undefined;
}> {
  let attrsRes = await readDeviceAttributes(device);
  checkDeviceRevisions(attrsRes);
  if (!checkDeviceInstanceCodeFormat(attrsRes.deviceInstanceCode)) {
    console.log('write device instance code');
    const code = generateRandomDeviceInstanceCode();
    writeDeviceInstanceCode(device, code);
    attrsRes = await readDeviceAttributes(device);
    if (!attrsRes.deviceInstanceCode) {
      throw new Error('failed to write device instance code');
    }
  }
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
  //   writeDeviceCustromParameters(device, parameterValues);
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

export function updateDeviceCustomParameterSingle(
  device: IDeviceWrapper,
  index: number,
  value: number,
) {
  device.writeSingleFrame(
    Packets.makeCustomParameterSignleWriteOperationFrame(index, value),
  );
}

export function sendSimulatorHidReport(
  device: IDeviceWrapper,
  report: number[],
) {
  if (report.length === 8) {
    console.log(JSON.stringify(report));
    const pk = Packets.makeSimulatorHidReportFrame(report);
    device.writeSingleFrame(pk);
  }
}

export function sendSimulatorMode(device: IDeviceWrapper, enabled: boolean) {
  // console.log(`writeSimulatorMode ${enabled ? 1 : 0}`);
  if (!enabled) {
    const blankHidReport = [0, 0, 0, 0, 0, 0, 0, 0];
    sendSimulatorHidReport(device, blankHidReport);
  }
  device.writeSingleFrame(Packets.makeSimulatorModeSpecFrame(enabled));
}

export function sendMuteMode(device: IDeviceWrapper, enabled: boolean) {
  device.writeSingleFrame(Packets.makeMuteModeSpecFrame(enabled));
}

export function sendDeviceOpenNotification(device: IDeviceWrapper) {
  device.writeSingleFrame(Packets.connectionOpenedFrame);
}

export function sendDeviceClosingNotification(device: IDeviceWrapper) {
  device.writeSingleFrame(Packets.connectionClosingFrame);
}
