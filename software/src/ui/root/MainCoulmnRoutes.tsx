import { css, FC, jsx } from 'qx';
import { uiReaders, uiState } from '~/ui/commonStore';
import {
  ProjectEditPage,
  ProjectLayoutEditPage,
  ProjectPresetEditPage,
  ProjectSelectionPage,
  SettingsPage,
  WelcomePage,
} from '~/ui/pages';
import { EditorPage } from '~/ui/pages/editor-page';
import { FirmwareUpdatePage } from '~/ui/pages/firmware-update-page';
import { UiLayouterPageComponent } from '~/ui/pages/layouter-page';
import { PresetBrowserPage } from '~/ui/pages/preset-browser-page';
import { PresetBrowserPage2 } from '~/ui/pages/preset-browser-page2';
import { ShapePreviewPage } from '~/ui/pages/shape-preview-page';

export const MainColumnRoutes: FC = () => {
  const { pageSpec } = uiState;
  if (pageSpec) {
    return (
      <div css={style}>
        {pageSpec.type === 'projectLayoutEdit' && (
          <ProjectLayoutEditPage spec={pageSpec} />
        )}
        {pageSpec.type === 'projectPresetEdit' && (
          <ProjectPresetEditPage spec={pageSpec} />
        )}
      </div>
    );
  }
  const { pagePath } = uiReaders;
  return (
    <div css={style}>
      {pagePath === '/editor' && <EditorPage />}
      {pagePath === '/layouter' && <UiLayouterPageComponent />}
      {pagePath === '/shapePreview' && <ShapePreviewPage />}
      {pagePath === '/firmwareUpdate' && <FirmwareUpdatePage />}
      {pagePath === '/presetBrowser' && <PresetBrowserPage />}
      {pagePath === '/presetBrowser2' && <PresetBrowserPage2 />}
      {pagePath === '/settings' && <SettingsPage />}
      {pagePath === '/projectSelection' && <ProjectSelectionPage />}
      {pagePath === '/home' && <WelcomePage />}
      {pagePath === '/projectEdit' && <ProjectEditPage />}
    </div>
  );
};

const style = css`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;
