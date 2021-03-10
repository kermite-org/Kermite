/* eslint-disable react/jsx-key */
import { css, FC, jsx } from 'qx';
import { useConnectedDeviceAttributes } from '~/ui-firmware-updation-page/dataSource';

const cssBase = css`
  td + td {
    padding-left: 20px;
  }
`;
export const ConnectedDeviceAttrsPart: FC = () => {
  const { deviceAttrs, projectInfo } = useConnectedDeviceAttributes();

  console.log({ deviceAttrs, projectInfo });

  const isOriginOnline = deviceAttrs?.origin === 'online';
  const tableData =
    deviceAttrs &&
    projectInfo &&
    ([
      ['ポート', deviceAttrs.portName],
      ['リソースオリジン', isOriginOnline ? 'オンライン' : 'ローカル'],
      ['プロジェクトID', deviceAttrs.projectId],
      ['プロジェクトパス', projectInfo.projectPath],
      ['キーボード名', projectInfo.keyboardName],
      ['個体番号', deviceAttrs.deviceInstanceCode],
      [
        'ファームウェアリビジョン',
        (isOriginOnline && deviceAttrs.firmwareBuildRevision) || 'N/A',
      ],
      isOriginOnline && [
        'ファームウェア最新リビジョン',
        projectInfo.firmwareBuildRevision,
      ],
      isOriginOnline && [
        'ファームウェア最新ビルド日時',
        projectInfo.firmwareBuildTimestamp,
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
