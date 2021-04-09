/* eslint-disable react/jsx-key */
import { css, FC, jsx } from 'qx';
import { texts } from '~/ui-common';
import { useConnectedDeviceAttributes } from '~/ui-firmware-updation-page/dataSource';

const cssBase = css`
  td + td {
    padding-left: 20px;
    max-width: 240px;
    overflow-x: hidden;
    white-space: nowrap;
  }
`;

function fixDatetimeText(datetimeText: string) {
  if (datetimeText.endsWith('Z')) {
    return new Date(datetimeText).toLocaleString();
  }
  return datetimeText;
}

export const ConnectedDeviceAttrsPart: FC = () => {
  const { deviceAttrs, projectInfo } = useConnectedDeviceAttributes();

  console.log({ deviceAttrs, projectInfo });

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
        isOriginOnline ? 'オンライン' : 'ローカル',
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
        firm && ['ファームウェア最新リビジョン', firm.buildRevision],

      isOriginOnline &&
        firm && [
          'ファームウェア最新ビルド日時',
          fixDatetimeText(firm.buildTimestamp),
        ],
      [
        texts.lebel_device_deviceInfo_fieldName_keymappingAreaSize,
        deviceAttrs.assignStorageCapacity + ' bytes',
      ],
    ].filter((a) => !!a) as [string, string][]);

  return (
    <div css={cssBase}>
      <div>{texts.label_device_deviceInfo_sectionTitle}</div>
      {tableData && (
        <div>
          <table>
            <tbody>
              {tableData.map((item, idx) => (
                <tr key={idx}>
                  <td>{item[0]}</td>
                  <td>{item[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
