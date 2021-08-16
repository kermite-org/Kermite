/* eslint-disable react/jsx-key */
import { texts } from '~/ui/base';
import { projectPackagesReader, uiStateReader } from '~/ui/commonStore';

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
  const deviceAttrs = uiStateReader.deviceStatus.deviceAttrs;
  const isOriginOnline = deviceAttrs?.origin === 'online';
  const firmwareInfo = projectPackagesReader.findFirmwareInfo(
    deviceAttrs?.firmwareId,
  );
  const tableData =
    deviceAttrs &&
    ([
      [texts.label_device_deviceInfo_fieldName_port, deviceAttrs.portName],
      [
        texts.label_device_deviceInfo_fieldName_resourceOrigin,
        isOriginOnline
          ? texts.label_device_deviceInfo_value_resourceOrigin_online
          : texts.label_device_deviceInfo_value_resourceOrigin_local,
      ],
      [
        texts.label_device_deviceInfo_fieldName_firmwareId,
        deviceAttrs.firmwareId,
      ],
      firmwareInfo && [
        texts.label_device_deviceInfo_fieldName_keyboardName,
        firmwareInfo.firmwareProjectPath,
      ],
      [
        texts.label_device_deviceInfo_fieldName_instanceNumber,
        deviceAttrs.deviceInstanceCode,
      ],
      [
        texts.label_device_deviceInfo_fieldName_firmwareVariation,
        deviceAttrs.firmwareVariationName,
      ],
      [texts.label_device_deviceInfo_fieldName_mcuName, deviceAttrs.mcuName],
      [
        texts.label_device_deviceInfo_fieldName_firmwareRevision,
        (isOriginOnline && deviceAttrs.firmwareBuildRevision) || 'N/A',
      ],
      isOriginOnline &&
        firmwareInfo && [
          texts.label_device_deviceInfo_fieldName_firmwareLatestRevision,
          firmwareInfo.buildRevision,
        ],
      isOriginOnline &&
        firmwareInfo && [
          texts.label_device_deviceInfo_fieldName_firmwareLatestTimestamp,
          fixDateTimeText(firmwareInfo.buildTimestamp),
        ],
      [
        texts.label_device_deviceInfo_fieldName_keymappingAreaSize,
        deviceAttrs.assignStorageCapacity + ' bytes',
      ],
    ].filter((a) => !!a) as [string, string][]);

  return { tableData };
}
