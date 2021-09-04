import { css, FC, jsx, useEffect } from 'qx';
import { cloneObject } from '~/shared';
import { GeneralInput, GeneralSelector } from '~/ui/components';
import {
  CustomFirmwareEditorModel,
  ICustomFirmwareSetupModalEditValues,
} from '~/ui/features/CustomFirmwareEditor/CustomFirmwareEditor.model';

export type Props = {
  editValues: ICustomFirmwareSetupModalEditValues;
};

export const CustomFirmwareEditor_OutputPropsSupplier = {
  get canSave(): boolean {
    const { variationName, customFirmwareId } =
      CustomFirmwareEditorModel.readers.editValues;
    return !!variationName && !!customFirmwareId;
  },
  emitSavingEditValues(): ICustomFirmwareSetupModalEditValues {
    return CustomFirmwareEditorModel.readers.editValues;
  },
};

export const CustomFirmwareEditor: FC<Props> = ({
  editValues: sourceEditValues,
}) => {
  const {
    actions: { loadEditValues, setVariationName, setCustomFirmwareId },
    readers: { editValues, allFirmwareOptions },
  } = CustomFirmwareEditorModel;
  useEffect(() => {
    loadEditValues(cloneObject(sourceEditValues));
  }, [sourceEditValues]);

  return (
    <div css={style}>
      <div className="row">
        <div>variation name</div>
        <GeneralInput
          value={editValues.variationName}
          setValue={setVariationName}
        />
      </div>
      <div className="row">
        <div>firmware</div>
        <GeneralSelector
          options={allFirmwareOptions}
          value={editValues.customFirmwareId}
          setValue={setCustomFirmwareId}
        />
      </div>
    </div>
  );
};

const style = css`
  > .row {
    margin-top: 10px;
    display: flex;
    align-items: center;

    > :nth-child(1) {
      width: 150px;
    }

    > :nth-child(2) {
      width: 200px;
    }
  }
`;
