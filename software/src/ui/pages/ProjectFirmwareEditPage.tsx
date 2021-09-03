import { css, FC, jsx, useMemo } from 'qx';
import {
  fallbackStandardKeyboardSpec,
  IKermiteStandardKeyboardSpec,
  IStandardFirmwareEntry,
} from '~/shared';
import { uiTheme } from '~/ui/base';
import { IPageSpec_ProjectFirmwareEdit } from '~/ui/commonModels';
import { projectPackagesWriter, uiActions, uiReaders } from '~/ui/commonStore';
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

  return (
    <div css={style}>
      <div>
        <button
          onClick={() => uiActions.navigateTo('/projectEdit')}
          className="back-button"
        >
          &lt;-back
        </button>
        project firmware edit page {firmwareName}
      </div>
      <StandardFirmwareEditor
        firmwareConfig={sourceFirmwareConfig}
        saveHandler={saveHandler}
      />
    </div>
  );
};

const style = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 15px;

  .back-button {
    margin-right: 10px;
  }
`;
