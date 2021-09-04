import { css, FC, jsx, useMemo } from 'qx';
import { ICustomFirmwareEntry } from '~/shared';
import { projectPackagesReader } from '~/ui/commonStore';
import { ClosableOverlay } from '~/ui/components';
import { RouteHeaderBar } from '~/ui/components/organisms/RouteHeaderBar/RouteHeaderBar';
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
  return { editValues };
}

export const ProjectCustomFirmwareSetupModal: FC<Props> = ({
  firmwareName,
  close,
}) => {
  const { editValues } = useMemo(
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

  const modalTitle = `edit custom firmware :${firmwareName}`;

  return (
    <ClosableOverlay close={close}>
      <div css={style}>
        <RouteHeaderBar
          title={modalTitle}
          canSave={canSave}
          saveHandler={saveHandler}
        />
        <div className="content">
          <CustomFirmwareEditor editValues={editValues} />
        </div>
      </div>
    </ClosableOverlay>
  );
};

const style = css`
  background: #fff;
  width: 450px;
  min-height: 150px;

  > .content {
    padding: 10px;
  }
`;
