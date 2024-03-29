import { css, FC, jsx, useInlineEffect } from 'alumina';
import { GeneralSelector } from '~/ui/components';
import {
  customFirmwareEditorModel,
  ICustomFirmwareEditValues,
} from '~/ui/featureEditors/customFirmwareEditor/customFirmwareEditor.model';

type Props = {
  sourceEditValues: ICustomFirmwareEditValues;
};

export const CustomFirmwareEditor_OutputPropsSupplier = {
  get canSave(): boolean {
    return customFirmwareEditorModel.readers.canSave;
  },
  emitSavingEditValues(): ICustomFirmwareEditValues {
    return customFirmwareEditorModel.readers.editValues;
  },
};

export const CustomFirmwareEditor: FC<Props> = ({ sourceEditValues }) => {
  const {
    actions: { setCustomFirmwareId, loadEditValues },
  } = customFirmwareEditorModel;
  useInlineEffect(() => loadEditValues(sourceEditValues), [sourceEditValues]);
  const {
    readers: { editValues, allFirmwareOptions },
  } = customFirmwareEditorModel;
  return (
    <div class={style}>
      <div class="row">
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
