import { editMutations, editReader, IDisplayArea } from '~/editor/models';
import {
  ConfigTextEditModelDynamic,
  IConfigTextEditModel,
} from '~/editor/viewModels/ConfigTextEditModel';
import { Hook } from '~/qx';

export function useDisplayAreaValueTextEditViewModel(
  propKey: keyof IDisplayArea
): IConfigTextEditModel {
  const model = Hook.useMemo(
    () =>
      new ConfigTextEditModelDynamic(
        [/^-?[0-9.]+$/],
        editMutations.startEdit,
        (text) => {
          const value = parseFloat(text);
          editMutations.setDisplayAreaValue(propKey, value);
        },
        editMutations.endEdit
      ),
    []
  );
  model.update(editReader.dispalyArea[propKey].toString());
  return model;
}
