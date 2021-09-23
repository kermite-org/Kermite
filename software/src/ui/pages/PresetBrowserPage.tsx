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
  const noPresets =
    model.projectSelectorSource.options.length === 1 &&
    model.presetSelectorSource.options.length === 0;
  return (
    <CommonPageFrame pageTitle={texts.label_presetBrowser_pageTitle}>
      <div css={style}>
        {noPresets && <div>No Presets Available</div>}
        {!noPresets && (
          <div>
            <PresetSelectionSection
              viewModel={viewModel.presetSelectionSectionViewModel}
            />
            <PresetKeyboardSection
              viewModel={viewModel.presetKeyboardSectionViewModel}
            />
          </div>
        )}
      </div>
    </CommonPageFrame>
  );
};

const style = css`
  > div > * + * {
    margin-top: 10px;
  }
`;
