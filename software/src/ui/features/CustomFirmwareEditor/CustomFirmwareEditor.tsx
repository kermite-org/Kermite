import { jsx } from 'qx';
import { cloneObject } from '~/shared';
import { IFeatureEditor } from '~/ui/base';
import {
  customFirmwareEditorModel,
  ICustomFirmwareEditValues,
} from '~/ui/features/CustomFirmwareEditor/CustomFirmwareEditor.model';
import { CustomFirmwareEditorView } from '~/ui/features/CustomFirmwareEditor/CustomFirmwareEditor.view';

export const CustomFirmwareEditor: IFeatureEditor<ICustomFirmwareEditValues> = {
  load(sourceEditValues: ICustomFirmwareEditValues) {
    const { loadEditValues } = customFirmwareEditorModel.actions;
    loadEditValues(cloneObject(sourceEditValues));
  },
  get canSave(): boolean {
    const { variationName, customFirmwareId } =
      customFirmwareEditorModel.readers.editValues;
    return !!variationName && !!customFirmwareId;
  },
  save(): ICustomFirmwareEditValues {
    return customFirmwareEditorModel.readers.editValues;
  },
  render() {
    return <CustomFirmwareEditorView />;
  },
};
