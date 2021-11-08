import { css, FC, jsx } from 'qx';
import { texts } from '~/ui/base';
import { CommonPageFrame } from '~/ui/components';
import { PresetKeyboardSection } from '~/ui/fabrics/PresetKeyboardSection/view';
import {
  PresetSelectionSection,
  usePresetSelectionModel,
  usePresetSelectionSectionViewModel,
} from '~/ui/features/PresetBrowser';

export const PresetBrowserPage: FC = () => {
  const model = usePresetSelectionModel();
  const presetSelectionSectionViewModel =
    usePresetSelectionSectionViewModel(model);
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
              viewModel={presetSelectionSectionViewModel}
            />
            <PresetKeyboardSection profileData={model.loadedProfileData} />
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
