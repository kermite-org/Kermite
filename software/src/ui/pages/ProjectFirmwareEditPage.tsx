import { css, FC, jsx, useMemo, useState } from 'qx';
import { fallbackStandardKeyboardSpec, IStandardFirmwareEntry } from '~/shared';
import { uiTheme } from '~/ui/base';
import { IPageSpec_ProjectFirmwareEdit } from '~/ui/commonModels';
import { projectPackagesWriter, uiReaders } from '~/ui/commonStore';
import { modalAlert, modalTextEdit } from '~/ui/components';
import { RouteHeaderBar } from '~/ui/components/organisms/RouteHeaderBar/RouteHeaderBar';
import {
  StandardFirmwareEditor,
  StandardFirmwareEditor_OutputPropsSupplier,
} from '~/ui/features/StandardFirmwareEditor/StandardFirmwareEditor';

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

const checkValidFirmwareVariationName = async (
  newFirmwareName: string,
): Promise<boolean> => {
  // eslint-disable-next-line no-irregular-whitespace
  // eslint-disable-next-line no-misleading-character-class
  if (!newFirmwareName.match(/^[^/./\\:*?"<>| \u3000\u0e49]+$/)) {
    await modalAlert(
      `${newFirmwareName} is not a valid firmware name. operation cancelled.`,
    );
    return false;
  }
  const projectInfo = uiReaders.editTargetProject;
  const isExist = projectInfo?.firmwares.some(
    (it) => it.variationName === newFirmwareName,
  );
  if (isExist) {
    await modalAlert(
      `${newFirmwareName} is already exists. operation cancelled.`,
    );
    return false;
  }
  return true;
};

async function inputSavingFirmwareName(): Promise<string | undefined> {
  const firmwareName = await modalTextEdit({
    message: 'firmware variation name',
    caption: 'save project firmware',
  });
  if (firmwareName !== undefined) {
    if (await checkValidFirmwareVariationName(firmwareName)) {
      return firmwareName;
    }
  }
  return undefined;
}

export const ProjectFirmwareEditPage: FC<Props> = ({
  spec: { firmwareName: sourceFirmwareName },
}) => {
  const [firmwareName, setFirmwareName] = useState(sourceFirmwareName);

  const sourceFirmwareConfig = useMemo(() => {
    const entry = readers.getEditTargetStandardFirmwareEntry(firmwareName);
    return entry?.standardFirmwareConfig || fallbackStandardKeyboardSpec;
  }, []);

  const { canSave, emitSavingEditValues } =
    StandardFirmwareEditor_OutputPropsSupplier;

  const saveHandler = async () => {
    const newConfig = emitSavingEditValues();
    if (firmwareName) {
      projectPackagesWriter.saveLocalProjectStandardFirmware(
        firmwareName,
        newConfig,
      );
    } else {
      const newFirmwareName = await inputSavingFirmwareName();
      if (newFirmwareName) {
        projectPackagesWriter.saveLocalProjectStandardFirmware(
          newFirmwareName,
          newConfig,
        );
        setFirmwareName(newFirmwareName);
      }
    }
  };

  const pageTitle = `edit project firmware: ${firmwareName || '(new)'}`;

  return (
    <div css={style}>
      <RouteHeaderBar
        title={pageTitle}
        backPagePath="/projectEdit"
        canSave={canSave}
        saveHandler={saveHandler}
      />
      <div className="content">
        <StandardFirmwareEditor firmwareConfig={sourceFirmwareConfig} />
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
