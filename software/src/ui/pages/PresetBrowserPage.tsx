import { css, FC, jsx } from 'qx';
import { texts } from '~/ui/base';
import { CommonPageFrame } from '~/ui/components';
import { PresetKeyboardSection, PresetSelectionSection } from '~/ui/fabrics';
import { usePresetSelectionModel } from '~/ui/features/PresetBrowser/models';

export const PresetBrowserPage: FC = () => {
  const {
    projectSelectorSource,
    presetSelectorSource,
    editSelectedProjectPreset,
    loadedProfileData,
  } = usePresetSelectionModel();
  const noPresets =
    projectSelectorSource.options.length === 1 &&
    presetSelectorSource.options.length === 0;
  return (
    <CommonPageFrame pageTitle={texts.label_presetBrowser_pageTitle}>
      <div css={style}>
        {noPresets && <div>No Presets Available</div>}
        {!noPresets && (
          <div>
            <PresetSelectionSection
              projectSelectorSource={projectSelectorSource}
              presetSelectorSource={presetSelectorSource}
              handleCreateProfileButton={editSelectedProjectPreset}
            />
            <PresetKeyboardSection profileData={loadedProfileData} />
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
