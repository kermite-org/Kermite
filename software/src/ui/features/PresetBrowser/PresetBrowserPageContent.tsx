import { css, FC, jsx } from 'alumina';
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
    canSelectProject,
  } = usePresetSelectionModel();
  return (
    <CommonPageFrame pageTitle={texts.presetBrowser.pageTitle}>
      <div class={style}>
        {isNoPresets && <div>No Presets Available</div>}
        {!isNoPresets && (
          <div>
            <PresetSelectionSection
              projectSelectorSource={projectSelectorSource}
              presetSelectorSource={presetSelectorSource}
              handleCreateProfileButton={createProfile}
              cansSelectProject={canSelectProject}
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
    <div class={style}>
      User profiles are served on &nbsp;
      <span class="link" onClick={onClick}>
        KermiteServer
      </span>
    </div>
  );
};
