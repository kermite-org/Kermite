import { jsx, css } from 'qx';
import { uiTheme, router, appUi } from '~/ui/base';
import { siteModel, uiStatusModel } from '~/ui/commonModels';
import { CustomWindowFrame, DevToolPullTab } from '~/ui/components';
import { LoadingOverlay } from '~/ui/components/overlay/LoadingOverlay';
import { EditorPage } from '~/ui/pages/editor-page';
import { FirmwareUpdationPage } from '~/ui/pages/firmware-updation-page';
import { UiLayouterPageComponent } from '~/ui/pages/layouter-page';
import { PresetBrowserPage } from '~/ui/pages/preset-browser-page';
import { PresetBrowserPage2 } from '~/ui/pages/preset-browser-page2';
import { UiSettingsPage } from '~/ui/pages/settings-page';
import { ShapePreviewPage } from '~/ui/pages/shape-preview-page';
import {
  NavigationColumn,
  WindowStatusBarSection,
  WindowTitleBarSection,
} from '~/ui/root/sections';

const styles = {
  cssContentRow: css`
    background: ${uiTheme.colors.clPageBackground};
    color: ${uiTheme.colors.clMainText};
    display: flex;
  `,

  cssMainColumn: css`
    flex-grow: 1;
  `,
};

const MainColumnRoutes = () => {
  const pagePath = router.getPagePath();
  return (
    <div css={styles.cssMainColumn}>
      {pagePath === '/editor' && <EditorPage />}
      {pagePath === '/layouter' && <UiLayouterPageComponent />}
      {pagePath === '/shapePreview' && <ShapePreviewPage />}
      {pagePath === '/firmwareUpdation' && <FirmwareUpdationPage />}
      {pagePath === '/presetBrowser' && <PresetBrowserPage />}
      {pagePath === '/presetBrowser2' && <PresetBrowserPage2 />}
      {pagePath === '/settings' && <UiSettingsPage />}
    </div>
  );
};

export const ConfiguratorZoneRoot = () => {
  return (
    <CustomWindowFrame
      renderTitleBar={WindowTitleBarSection}
      renderStatusBar={WindowStatusBarSection}
    >
      <div css={styles.cssContentRow}>
        <NavigationColumn />
        <MainColumnRoutes />
        <LoadingOverlay isLoading={uiStatusModel.status.isLoading} />
        <DevToolPullTab
          qxIf={appUi.isDevelopment}
          handler={siteModel.toggleDevToolVisible}
        />
      </div>
    </CustomWindowFrame>
  );
};
