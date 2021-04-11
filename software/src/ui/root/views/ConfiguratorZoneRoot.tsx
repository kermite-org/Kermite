import { jsx, css } from 'qx';
import { appUi, router, uiTheme } from '~/ui/common';
import { EditorPage } from '~/ui/editor-page/EditorPage';
import { FirmwareUpdationPage } from '~/ui/firmware-updation-page';
import { RealtimeHeatmapPage } from '~/ui/heatmap-page';
import { UiLayouterPageComponent } from '~/ui/layouter-page';
import { PresetBrowserPage } from '~/ui/preset-browser-page';
import { PresetBrowserPage2 } from '~/ui/preset-browser-page2';
import { WindowStatusBarSection } from '~/ui/root/views/titleBar/WindowStatusBarSection';
import { CustomWindowFrame } from '~/ui/root/views/window/CustomWindowFrame';
import { DevToolPullTab } from '~/ui/root/views/window/DevToolPullTab';
import { UiSettingsPage } from '~/ui/settings-page';
import { ShapePreviewPage } from '~/ui/shape-preview-page';
import { NavigationColumn } from './navigation/NavigationColumn';
import { WindowTitleBarSection } from './titleBar/WindowTitleBarSection';

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

export const ConfiguratorZoneRoot = () => {
  const pagePath = router.getPagePath();
  return (
    <CustomWindowFrame
      renderTitleBar={WindowTitleBarSection}
      renderStatusBar={WindowStatusBarSection}
    >
      <div css={styles.cssContentRow}>
        <NavigationColumn />
        <div css={styles.cssMainColumn}>
          {pagePath === '/editor' && <EditorPage />}
          {pagePath === '/layouter' && <UiLayouterPageComponent />}
          {pagePath === '/shapePreview' && <ShapePreviewPage />}
          {pagePath === '/firmwareUpdation' && <FirmwareUpdationPage />}
          {pagePath === '/presetBrowser' && <PresetBrowserPage />}
          {pagePath === '/presetBrowser2' && <PresetBrowserPage2 />}
          {pagePath === '/heatmap' && <RealtimeHeatmapPage />}
          {pagePath === '/settings' && <UiSettingsPage />}
        </div>
        <DevToolPullTab qxIf={appUi.isDevelopment} />
      </div>
    </CustomWindowFrame>
  );
};
