/* eslint-disable react/jsx-key */
import { texts } from '~/ui/base';
import { projectPackagesReader, uiStateReader } from '~/ui/commonStore';

interface IConnectedDevicesAttrsPartModel {
  tableData: [string, string][] | undefined;
}

function fixDatetimeText(datetimeText: string) {
  if (datetimeText.endsWith('Z')) {
    return new Date(datetimeText).toLocaleString();
  }
  return datetimeText;
}

export function useConnectedDevicesAttrsPartModel(): IConnectedDevicesAttrsPartModel {
  const deviceAttrs = uiStateReader.deviceStatus.deviceAttrs;
  const isOriginOnline = deviceAttrs?.origin === 'online';
  const firmwareInfo = projectPackagesReader.findFirmwareInfo(
    deviceAttrs?.firmwareId,
  );
  const tableData =
    deviceAttrs &&
    ([
      [texts.lebel_device_deviceInfo_fieldName_port, deviceAttrs.portName],
      [
        texts.lebel_device_deviceInfo_fieldName_resourceOrigin,
        isOriginOnline
          ? texts.lebel_device_deviceInfo_value_resourceOrigin_online
          : texts.lebel_device_deviceInfo_value_resourceOrigin_local,
      ],
      [
        texts.lebel_device_deviceInfo_fieldName_firmwareId,
        deviceAttrs.firmwareId,
      ],
      firmwareInfo && [
        texts.lebel_device_deviceInfo_fieldName_keyboardName,
        firmwareInfo.firmwareProjectPath,
      ],
      [
        texts.lebel_device_deviceInfo_fieldName_instanceNumber,
        deviceAttrs.deviceInstanceCode,
      ],
      [
        texts.lebel_device_deviceInfo_fieldName_firmwareVariation,
        deviceAttrs.firmwareVariationName,
      ],
      [texts.lebel_device_deviceInfo_fieldName_mcuName, deviceAttrs.mcuName],
      [
        texts.lebel_device_deviceInfo_fieldName_firmwareRevision,
        (isOriginOnline && deviceAttrs.firmwareBuildRevision) || 'N/A',
      ],
      isOriginOnline &&
        firmwareInfo && [
          texts.lebel_device_deviceInfo_fieldName_firmwareLatestRevision,
          firmwareInfo.buildRevision,
        ],
      isOriginOnline &&
        firmwareInfo && [
          texts.lebel_device_deviceInfo_fieldName_firmwareLatestTimestamp,
          fixDatetimeText(firmwareInfo.buildTimestamp),
        ],
      [
        texts.lebel_device_deviceInfo_fieldName_keymappingAreaSize,
        deviceAttrs.assignStorageCapacity + ' bytes',
      ],
    ].filter((a) => !!a) as [string, string][]);

  return { tableData };
}
