/* eslint-disable react/jsx-key */
import { css, FC, jsx } from 'qx';
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
      ['ポート', deviceAttrs.portName],
      ['リソースオリジン', isOriginOnline ? 'オンライン' : 'ローカル'],
      ['プロジェクトID', deviceAttrs.projectId],
      projectInfo && ['プロジェクトパス', projectInfo.projectPath],
      projectInfo && ['キーボード名', projectInfo.keyboardName],
      ['個体番号', deviceAttrs.deviceInstanceCode],
      ['ファームウェアバリエーション', deviceAttrs.firmwareVariationName],
      [
        'ファームウェアリビジョン',
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
        'キーマッピング領域サイズ',
        deviceAttrs.assignStorageCapacity + ' bytes',
      ],
    ].filter((a) => !!a) as [string, string][]);

  return (
    <div css={cssBase}>
      <div>デバイス情報</div>
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
