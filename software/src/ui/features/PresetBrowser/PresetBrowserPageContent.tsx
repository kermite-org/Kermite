import { css, FC, jsx } from 'qx';
import { texts } from '~/ui/base';
import { CommonPageFrame } from '~/ui/components';
import { PresetKeyboardSection, PresetSelectionSection } from '~/ui/fabrics';
import { usePresetSelectionModel3 } from '~/ui/features/PresetBrowser/models/PresetSelectionModel3';

export const PresetBrowserPageContent: FC = () => {
  const {
    projectSelectorSource,
    presetSelectorSource,
    createProfile,
    loadedProfileData,
    canSelectProject,
  } = usePresetSelectionModel3();
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
              handleCreateProfileButton={createProfile}
              cansSelectProject={canSelectProject}
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
    margin-top: 15px;
  }
`;
