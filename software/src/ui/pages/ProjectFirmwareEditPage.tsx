import { css, FC, jsx, useMemo } from 'qx';
import {
  fallbackStandardKeyboardSpec,
  IKermiteStandardKeyboardSpec,
  IStandardFirmwareEntry,
} from '~/shared';
import { uiTheme } from '~/ui/base';
import { IPageSpec_ProjectFirmwareEdit } from '~/ui/commonModels';
import { projectPackagesWriter, uiReaders } from '~/ui/commonStore';
import { RouteHeaderBar } from '~/ui/components/organisms/RouteHeaderBar/RouteHeaderBar';
import { StandardFirmwareEditor } from '~/ui/features/StandardFirmwareEditor/StandardFirmwareEditor';

type Props = {
  spec: IPageSpec_ProjectFirmwareEdit;
};

const readers = {
  getEditTargetStandardFirmwareEntry(
    firmwareName: string,
  ): IStandardFirmwareEntry | undefined {
    const projectInfo = uiReaders.editTargetProject;
    const entry = projectInfo?.firmwares.find(
      (it) => it.variationName === firmwareName,
    );
    if (entry?.type === 'standard') {
      return entry;
    }
    return undefined;
  },
};

export const ProjectFirmwareEditPage: FC<Props> = ({
  spec: { firmwareName },
}) => {
  const sourceFirmwareConfig = useMemo(() => {
    const entry = readers.getEditTargetStandardFirmwareEntry(firmwareName);
    return entry?.standardFirmwareConfig || fallbackStandardKeyboardSpec;
  }, []);

  const saveHandler = (newConfig: IKermiteStandardKeyboardSpec) => {
    projectPackagesWriter.saveLocalProjectStandardFirmware(
      firmwareName,
      newConfig,
    );
  };

  const pageTitle = `edit project firmware: ${firmwareName}`;

  return (
    <div css={style}>
      <RouteHeaderBar title={pageTitle} backPagePath="/projectEdit" />
      <div className="content">
        <StandardFirmwareEditor
          firmwareConfig={sourceFirmwareConfig}
          saveHandler={saveHandler}
        />
      </div>
    </div>
  );
};

const style = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  > .content {
    padding: 15px;
  }
`;
