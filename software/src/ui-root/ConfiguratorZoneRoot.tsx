import { css } from 'goober';
import { h } from 'qx';
import { appUi, router, uiTheme } from '~/ui-common';
import { EditorPage } from '~/ui-editor-page/EditorPage';
import { FirmwareUpdationPage } from '~/ui-firmware-updation-page';
import { HeatmapPage } from '~/ui-heatmap-page';
import { UiLayouterPageComponent } from '~/ui-layouter-page';
import { PresetBrowserPage } from '~/ui-preset-browser-page';
import { WindowStatusBarSection } from '~/ui-root/views/titleBar/WindowStatusBarSection';
import { CustomWindowFrame } from '~/ui-root/views/window/CustomWindowFrame';
import { DevToolPullTab } from '~/ui-root/views/window/DevToolPullTab';
import { UiSettingsPage } from '~/ui-settings-page';
import { KeyboardShapePreviewPage } from '~/ui-shape-preview-page/ShapePreviewPage';
import { NavigationColumn } from './views/navigation/NavigationColumn';
import { WindowTitleBarSection } from './views/titleBar/WindowTitleBarSection';

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
          {pagePath === '/shapePreview' && <KeyboardShapePreviewPage />}
          {pagePath === '/firmwareUpdation' && <FirmwareUpdationPage />}
          {pagePath === '/presetBrowser' && <PresetBrowserPage />}
          {pagePath === '/heatmap' && <HeatmapPage />}
          {pagePath === '/settings' && <UiSettingsPage />}
        </div>
        <DevToolPullTab qxIf={appUi.isDevelopment} />
      </div>
    </CustomWindowFrame>
  );
};
