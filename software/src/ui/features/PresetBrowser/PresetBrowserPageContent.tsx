import { css, FC, jsx } from 'qx';
import { ipcAgent, texts } from '~/ui/base';
import { CommonPageFrame } from '~/ui/components';
import { PresetKeyboardSection, PresetSelectionSection } from '~/ui/fabrics';
import { usePresetSelectionModel } from '~/ui/features/PresetBrowser/PresetSelectionModel';

export const PresetBrowserPageContent: FC = () => {
  const {
    projectSelectorSource,
    presetSelectorSource,
    createProfile,
    loadedProfileData,
    isNoPresets,
  } = usePresetSelectionModel();
  return (
    <CommonPageFrame pageTitle={texts.label_presetBrowser_pageTitle}>
      <div css={style}>
        {isNoPresets && <div>No Presets Available</div>}
        {!isNoPresets && (
          <div>
            <PresetSelectionSection
              projectSelectorSource={projectSelectorSource}
              presetSelectorSource={presetSelectorSource}
              handleCreateProfileButton={createProfile}
              cansSelectProject={true}
            />
            <PresetKeyboardSection profileData={loadedProfileData} />
            <KermiteServerLinkPart />
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

const KermiteServerLinkPart: FC = () => {
  const style = css`
    margin-top: 10px;
    display: flex;
    justify-content: flex-end;
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
      User profiles are served on &nbsp;
      <span className="link" onClick={onClick}>
        KermiteServer
      </span>
    </div>
  );
};
