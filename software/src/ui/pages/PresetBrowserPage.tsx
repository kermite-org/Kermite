import { css, FC, jsx } from 'qx';
import { texts } from '~/ui/base';
import { CommonPageFrame } from '~/ui/components';
import {
  usePresetBrowserViewModel,
  PresetSelectionSection,
  PresetKeyboardSection,
  usePresetSelectionModel,
} from '~/ui/features/PresetBrowser';

export const PresetBrowserPage: FC = () => {
  const model = usePresetSelectionModel();
  const viewModel = usePresetBrowserViewModel(model);
  return (
    <CommonPageFrame pageTitle={texts.label_presetBrowser_pageTitle}>
      <div css={style}>
        <PresetSelectionSection
          viewModel={viewModel.presetSelectionSectionViewModel}
        />
        <PresetKeyboardSection
          viewModel={viewModel.presetKeyboardSectionViewModel}
        />
      </div>
    </CommonPageFrame>
  );
};

const style = css`
  > * + * {
    margin-top: 10px;
  }
`;
