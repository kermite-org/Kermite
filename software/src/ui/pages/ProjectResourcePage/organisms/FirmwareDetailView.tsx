import { css, FC, jsx } from 'qx';
import { IKermiteStandardKeyboardSpec } from '~/shared';
import { uiReaders } from '~/ui/commonStore';
import { useMemoEx } from '~/ui/helpers';
import { projectResourceHelpers } from '~/ui/pages/ProjectResourcePage/core';

type Props = {
  firmwareName: string;
};

export const FirmwareDetailView: FC<Props> = ({ firmwareName }) => {
  const firmwareEntry = useMemoEx(projectResourceHelpers.getFirmwareEntry, [
    firmwareName,
  ])!;
  return (
    <div css={style}>
      {firmwareEntry.type === 'standard' && (
        <StandardFirmwareDetailView
          config={firmwareEntry.standardFirmwareConfig}
        />
      )}
      {firmwareEntry.type === 'custom' && (
        <CustomFirmwareDetailView
          customFirmwareId={firmwareEntry.customFirmwareId}
        />
      )}
    </div>
  );
};

const StandardFirmwareDetailView: FC<{
  config: IKermiteStandardKeyboardSpec;
}> = ({ config }) => {
  return <div>base firmware type: {config.baseFirmwareType}</div>;
};

const CustomFirmwareDetailView: FC<{
  customFirmwareId: string;
}> = ({ customFirmwareId }) => {
  const firmwareInfo = uiReaders.allCustomFirmwareInfos.find(
    (it) => it.firmwareId === customFirmwareId,
  )!;
  return (
    <div>
      <div>firmware id: {firmwareInfo.firmwareId}</div>
      <div>project path: {firmwareInfo.firmwareProjectPath}</div>
      <div>variation name: {firmwareInfo.variationName}</div>
      <div>target device: {firmwareInfo.targetDevice}</div>
    </div>
  );
};

const style = css`
  > div {
    > * + * {
      margin-top: 5px;
    }
  }
`;
