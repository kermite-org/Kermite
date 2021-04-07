/* eslint-disable react/jsx-key */
import { texts } from '~/ui-common';
import { useConnectedDeviceAttributes } from '~/ui-firmware-updation-page/models';

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
  const { deviceAttrs, projectInfo } = useConnectedDeviceAttributes();

  // console.log({ deviceAttrs, projectInfo });

  const isOriginOnline = deviceAttrs?.origin === 'online';

  const firm = projectInfo?.firmwares.find(
    (f) => f.variationName === deviceAttrs?.firmwareVariationName,
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
        texts.lebel_device_deviceInfo_fieldName_projectID,
        deviceAttrs.projectId,
      ],
      projectInfo && [
        texts.lebel_device_deviceInfo_fieldName_projectPath,
        projectInfo.projectPath,
      ],
      projectInfo && [
        texts.lebel_device_deviceInfo_fieldName_keyboardName,
        projectInfo.keyboardName,
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
        firm && [
          texts.lebel_device_deviceInfo_fieldName_firmwareLatestRevision,
          firm.buildRevision,
        ],

      isOriginOnline &&
        firm && [
          texts.lebel_device_deviceInfo_fieldName_firmwareLatestTimestamp,
          fixDatetimeText(firm.buildTimestamp),
        ],
      [
        texts.lebel_device_deviceInfo_fieldName_keymappingAreaSize,
        deviceAttrs.assignStorageCapacity + ' bytes',
      ],
    ].filter((a) => !!a) as [string, string][]);

  return { tableData };
}
