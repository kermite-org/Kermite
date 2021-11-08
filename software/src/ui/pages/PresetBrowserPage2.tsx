import { css, FC, jsx } from 'qx';
import { ipcAgent, texts } from '~/ui/base';
import { CommonPageFrame } from '~/ui/components';
import { PresetKeyboardSection } from '~/ui/fabrics/PresetKeyboardSection/view';
import {
  PresetSelectionSection,
  usePresetSelectionModel2,
  usePresetSelectionSectionViewModel,
} from '~/ui/features/PresetBrowser';

export const PresetBrowserPage2: FC = () => {
  const model = usePresetSelectionModel2();
  const presetSelectionSectionViewModel =
    usePresetSelectionSectionViewModel(model);
  const noPresets = model.projectSelectorSource.options.length === 0;
  return (
    <CommonPageFrame pageTitle={texts.label_presetBrowser2_pageTitle}>
      <div css={style}>
        {noPresets && <div>No Presets Available</div>}
        {!noPresets && (
          <div>
            <PresetSelectionSection
              viewModel={presetSelectionSectionViewModel}
            />
            <PresetKeyboardSection profileData={model.loadedProfileData} />
            <CustomContent />
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

const CustomContent: FC = () => {
  const style = css`
    margin-top: 10px;
    display: flex;
    justify-content: center;
    .link {
      color: blue;
      cursor: pointer;
    }
  `;
  const onClick = () => {
    ipcAgent.async.platform_openUrlInDefaultBrowser(
      'https://dev.server.kermite.org/',
    );
  };
  return (
    <div css={style}>
      Profiles served on &nbsp;
      <span className="link" onClick={onClick}>
        KermiteServer
      </span>
    </div>
  );
};
