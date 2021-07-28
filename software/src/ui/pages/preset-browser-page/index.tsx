import { FC, jsx } from 'qx';
import { texts } from '~/ui/common';
import { usePresetSelectionModel } from '~/ui/pages/preset-browser-page/models';
import { usePresetBrowserViewModel } from '~/ui/pages/preset-browser-page/viewModels';
import { PresetBrowserPageView } from '~/ui/pages/preset-browser-page/views/PresetBrowserPageView';

export const PresetBrowserPage: FC = () => {
  const model = usePresetSelectionModel();
  const viewModel = usePresetBrowserViewModel(model);
  return (
    <PresetBrowserPageView
      pageTitle={texts.label_presetBrowser_pageTitle}
      viewModel={viewModel}
    />
  );
};
