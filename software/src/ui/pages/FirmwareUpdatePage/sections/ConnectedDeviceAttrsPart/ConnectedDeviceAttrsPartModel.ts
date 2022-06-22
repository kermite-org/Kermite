/* eslint-disable react/jsx-key */
import { getMcuNameFromKermiteMcuCode } from '~/shared';
import { texts } from '~/ui/base';
import { projectPackagesReader, uiReaders } from '~/ui/store';

interface IConnectedDevicesAttrsPartModel {
  tableData: [string, string][] | undefined;
}

function fixDateTimeText(dateTimeText: string) {
  if (dateTimeText.endsWith('Z')) {
    return new Date(dateTimeText).toLocaleString();
  }
  return dateTimeText;
}

export function useConnectedDevicesAttrsPartModel(): IConnectedDevicesAttrsPartModel {
  const { deviceStatus } = uiReaders;
  const deviceAttrs =
    (deviceStatus.isConnected && deviceStatus.deviceAttrs) || undefined;
  const isOriginOnline = deviceAttrs?.origin === 'online';
  const firmwareInfo = projectPackagesReader.findFirmwareInfo(
    deviceAttrs?.firmwareId,
  );

  const tableData =
    deviceAttrs &&
    ([
      // [texts.deviceInformation.fieldName_port, deviceAttrs.portName],
      [
        texts.deviceInformation.fieldName_keyboardName,
        deviceAttrs.keyboardName,
      ],
      ['projectId', deviceAttrs.projectId],
      ['variationId', deviceAttrs.variationId],
      [texts.deviceInformation.fieldName_firmwareId, deviceAttrs.firmwareId],
      [
        texts.deviceInformation.fieldName_instanceNumber,
        deviceAttrs.deviceInstanceCode,
      ],
      // ['manufacturerName', deviceAttrs.manufacturerName],
      [
        texts.deviceInformation.fieldName_firmwareVariation,
        deviceAttrs.firmwareVariationName,
      ],
      [
        texts.deviceInformation.fieldName_mcuName,
        getMcuNameFromKermiteMcuCode(deviceAttrs.mcuCode),
      ],
      [
        texts.deviceInformation.fieldName_resourceOrigin,
        isOriginOnline
          ? texts.deviceInformation.value_resourceOrigin_online
          : texts.deviceInformation.value_resourceOrigin_local,
      ],
      [
        texts.deviceInformation.fieldName_firmwareRevision,
        (isOriginOnline && deviceAttrs.firmwareBuildRevision) || 'N/A',
      ],
      isOriginOnline &&
        firmwareInfo && [
          texts.deviceInformation.fieldName_firmwareLatestRevision,
          firmwareInfo.buildRevision,
        ],
      isOriginOnline &&
        firmwareInfo && [
          texts.deviceInformation.fieldName_firmwareLatestTimestamp,
          fixDateTimeText(firmwareInfo.buildTimestamp),
        ],
      [
        texts.deviceInformation.fieldName_keymappingAreaSize,
        deviceAttrs.assignStorageCapacity + ' bytes',
      ],
    ].filter((a) => !!a) as [string, string][]);

  return { tableData };
}
