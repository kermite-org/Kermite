import { css, FC, jsx, useMemo } from 'qx';
import { ICustomFirmwareEntry } from '~/shared';
import { projectPackagesReader, uiReaders } from '~/ui/commonStore';
import { ClosableOverlay } from '~/ui/components';
import {
  CustomFirmwareEditor,
  CustomFirmwareEditor_OutputPropsSupplier,
} from '~/ui/features/CustomFirmwareEditor/CustomFirmwareEditor';

type Props = {
  firmwareName: string;
  close(): void;
};

function createSourceEditValues(entry: ICustomFirmwareEntry | undefined) {
  if (entry) {
    const { variationName, customFirmwareId } = entry;
    return { variationName, customFirmwareId };
  } else {
    return { variationName: '', customFirmwareId: '' };
  }
}

function getSourceFirmwareProps(variationName: string) {
  const entry = projectPackagesReader.getEditTargetFirmwareEntry(
    'custom',
    variationName,
  );
  const editValues = createSourceEditValues(entry);
  const existingFirmwareNames =
    uiReaders.editTargetProject?.firmwares.map((it) => it.variationName) || [];

  return { editValues, existingFirmwareNames };
}

export const ProjectCustomFirmwareSetupModal: FC<Props> = ({
  firmwareName,
  close,
}) => {
  const { editValues, existingFirmwareNames } = useMemo(
    () => getSourceFirmwareProps(firmwareName),
    [],
  );

  const { canSave, emitSavingEditValues } =
    CustomFirmwareEditor_OutputPropsSupplier;

  const saveHandler = () => {
    const newEditValues = emitSavingEditValues();
    console.log(JSON.stringify(newEditValues));
    close();
  };

  return (
    <ClosableOverlay close={close}>
      <div css={style}>
        custom firmware setup modal {firmwareName}
        <CustomFirmwareEditor
          editValues={editValues}
          existingFirmwareNames={existingFirmwareNames}
        />
        <button onClick={saveHandler} disabled={!canSave}>
          save
        </button>
      </div>
    </ClosableOverlay>
  );
};

const style = css`
  background: #fff;
  padding: 10px;
  width: 400px;
`;
