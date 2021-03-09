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

  const tableData =
    (deviceAttrs &&
      projectInfo && [
        ['ポート', deviceAttrs.portName],
        [
          'リソースオリジン',
          deviceAttrs.origin === 'local' ? 'ローカル' : 'オンライン',
        ],
        ['プロジェクトID', deviceAttrs.projectId],
        ['プロジェクトパス', projectInfo.projectPath],
        ['キーボード名', projectInfo.keyboardName],
        ['個体番号', deviceAttrs.deviceInstanceCode],
        ['ファームウェアビルドリビジョン', deviceAttrs.firmwareBuildRevision],
        [
          'キーマッピング領域サイズ',
          deviceAttrs.assignStorageCapacity + ' bytes',
        ],
      ]) ||
    undefined;

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
