import {
  IPresetSelectionSectionViewModel,
  IPresetKeyboardSectionViewModel,
  usePresetSelectionSectionViewModel,
  usePresetKeyboardSectionViewModel,
} from '~/ui/features/PresetBrowser';
import { IPresetSelectionModel } from '~/ui/features/PresetBrowser/models';

export interface IPresetBrowserViewModel {
  presetSelectionSectionViewModel: IPresetSelectionSectionViewModel;
  presetKeyboardSectionViewModel: IPresetKeyboardSectionViewModel;
}

export function usePresetBrowserViewModel(
  model: IPresetSelectionModel,
): IPresetBrowserViewModel {
  const presetSelectionSectionViewModel =
    usePresetSelectionSectionViewModel(model);
  const presetKeyboardSectionViewModel = usePresetKeyboardSectionViewModel(
    model.loadedProfileData,
  );
  return {
    presetSelectionSectionViewModel,
    presetKeyboardSectionViewModel,
  };
}
