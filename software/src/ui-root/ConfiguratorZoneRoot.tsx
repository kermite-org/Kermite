import { css } from 'goober';
import { h } from 'qx';
import { uiTheme } from '~/ui-common';
import { uiStatusModel } from '~/ui-common/sharedModels/UiStatusModel';
import { EditorPage } from '~/ui-editor-page/EditorPage';
import { FirmwareUpdationPage } from '~/ui-firmware-updation-page';
import { HeatmapPage } from '~/ui-heatmap-page';
import { UiLayouterPageComponent } from '~/ui-layouter-page';
import { PresetBrowserPage } from '~/ui-preset-browser-page';
import { CustomWindowFrame } from '~/ui-root/views/window/CustomWindowFrame';
import { DevToolPullTab } from '~/ui-root/views/window/DevToolPullTab';
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
  const { page } = uiStatusModel.settings;

  return (
    <CustomWindowFrame renderTitleBar={() => <WindowTitleBarSection />}>
      <div css={styles.cssContentRow}>
        <NavigationColumn />
        <div css={styles.cssMainColumn}>
          {page === 'editor' && <EditorPage />}
          {page === 'layouter' && <UiLayouterPageComponent />}
          {page === 'shapePreview' && <KeyboardShapePreviewPage />}
          {page === 'firmwareUpdation' && <FirmwareUpdationPage />}
          {page === 'presetBrowser' && <PresetBrowserPage />}
          {page === 'heatmap' && <HeatmapPage />}
        </div>
        <DevToolPullTab />
      </div>
    </CustomWindowFrame>
  );
};
