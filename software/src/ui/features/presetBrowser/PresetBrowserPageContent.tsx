import { css, FC, jsx, useEffect } from 'alumina';
import { texts } from '~/ui/base';
import { CommonPageFrame } from '~/ui/components';
import { PresetKeyboardSection, PresetSelectionSection } from '~/ui/fabrics';
import { presetSelectionStore } from '~/ui/store/domains/presetSelectionStore';

export const PresetBrowserPageContent: FC = () => {
  useEffect(presetSelectionStore.initializeOnMount, []);
  const {
    readers: {
      projectSelectorSource,
      presetSelectorSource,

      loadedProfileData,
      isNoPresets,
      canSelectProject,
    },
    actions: { createProfile },
  } = presetSelectionStore;

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
    > a.link {
      color: blue;
      cursor: pointer;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  `;
  return (
    <div class={style}>
      User profiles are served on &nbsp;
      <a
        href="https://server.kermite.org"
        target="_blank"
        class="link"
        rel="noreferrer"
      >
        KermiteServer
      </a>
    </div>
  );
};
