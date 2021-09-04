import { FC, jsx, useEffect } from 'qx';
import {
  CustomFirmwareEditorModel,
  ICustomFirmwareSetupModalEditValues,
} from '~/ui/features/CustomFirmwareEditor/CustomFirmwareEditor.model';

export type Props = {
  editValues: ICustomFirmwareSetupModalEditValues;
  existingFirmwareNames: string[];
};

export const CustomFirmwareEditor_OutputPropsSupplier = {
  get canSave() {
    return true;
  },
  emitSavingEditValues() {
    return CustomFirmwareEditorModel.readers.editValues;
  },
};

export const CustomFirmwareEditor: FC<Props> = ({
  editValues: sourceEditValues,
  existingFirmwareNames,
}) => {
  const {
    actions: { loadEditValues },
    readers: { editValues },
  } = CustomFirmwareEditorModel;
  useEffect(() => loadEditValues(sourceEditValues), [sourceEditValues]);
  return (
    <div>
      custom firmware editor
      {JSON.stringify({ editValues, existingFirmwareNames }, null, ' ')}
    </div>
  );
};
