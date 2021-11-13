/* eslint-disable react/jsx-key */
import { css, FC, jsx } from 'alumina';
import { texts } from '~/ui/base';
import {
  PartBody,
  PartHeader,
} from '~/ui/pages/firmware-update-page/Components';
import { useConnectedDevicesAttrsPartModel } from '~/ui/pages/firmware-update-page/sections/ConnectedDeviceAttrsPart/ConnectedDeviceAttrsPartModel';

export const ConnectedDeviceAttrsPart: FC = () => {
  const { tableData } = useConnectedDevicesAttrsPartModel();
  return (
    <div css={style}>
      <PartHeader>{texts.label_device_deviceInfo_sectionTitle}</PartHeader>
      <PartBody>
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
      </PartBody>
    </div>
  );
};

const style = css`
  td + td {
    padding-left: 20px;
    max-width: 240px;
    overflow-x: hidden;
    white-space: nowrap;
  }
`;
