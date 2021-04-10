import { FC, jsx } from 'qx';
import { texts } from '~/ui/common';
import { usePresetBrowserViewModel } from '~/ui/preset-browser-page/viewModels';
import { PresetBrowserPageView } from '~/ui/preset-browser-page/views/PresetBrowserPageView';
import { usePresetSelectionModel2 } from '~/ui/preset-browser-page2/models/PresetSelectionModel2';

export const PresetBrowserPage2: FC = () => {
  const model = usePresetSelectionModel2();
  const viewModel = usePresetBrowserViewModel(model);
  return (
    <PresetBrowserPageView
      pageTitle={texts.label_presetBrowser2_pageTitle}
      viewModel={viewModel}
    />
  );
};
