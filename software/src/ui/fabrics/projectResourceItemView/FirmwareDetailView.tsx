import { css, FC, jsx, useMemo } from 'alumina';
import { IProjectPackageInfo, IStandardFirmwareConfig } from '~/shared';
import { uiReaders } from '~/ui/store';

type Props = {
  projectInfo: IProjectPackageInfo;
  firmwareName: string;
};

export const FirmwareDetailView: FC<Props> = ({
  projectInfo,
  firmwareName,
}) => {
  const firmwareEntry = useMemo(
    () => projectInfo.firmwares.find((it) => it.firmwareName === firmwareName),
    [projectInfo, firmwareName],
  );
  return (
    <div class={style}>
      {firmwareEntry?.type === 'standard' && (
        <StandardFirmwareDetailView
          config={firmwareEntry.standardFirmwareConfig}
        />
      )}
      {firmwareEntry?.type === 'custom' && (
        <CustomFirmwareDetailView
          customFirmwareId={firmwareEntry.customFirmwareId}
        />
      )}
    </div>
  );
};

const StandardFirmwareDetailView: FC<{
  config: IStandardFirmwareConfig;
}> = ({ config }) => {
  return (
    <div>
      <div>firmware type: standard</div>
      <div> base firmware: {config.baseFirmwareType}</div>
    </div>
  );
};

const CustomFirmwareDetailView: FC<{
  customFirmwareId: string;
}> = ({ customFirmwareId }) => {
  const firmwareInfo = uiReaders.allCustomFirmwareInfos.find(
    (it) => it.firmwareId === customFirmwareId,
  )!;
  if (!firmwareInfo) {
    return null;
  }
  return (
    <div>
      <div>firmware type: custom</div>
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
