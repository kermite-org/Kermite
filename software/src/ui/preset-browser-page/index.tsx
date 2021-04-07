import { FC, jsx } from 'qx';
import { usePresetSelectionModel } from '~/ui/preset-browser-page/models';
import { usePresetBrowserViewModel } from '~/ui/preset-browser-page/viewModels';
import { PresetBrowserPageView } from '~/ui/preset-browser-page/views/PresetBrowserPageView';

export const PresetBrowserPage: FC = () => {
  const model = usePresetSelectionModel();
  const viewModel = usePresetBrowserViewModel(model);
  return (
    <PresetBrowserPageView pageTitle="Preset Browser" viewModel={viewModel} />
  );
};
