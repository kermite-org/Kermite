import { css } from 'goober';
import { h } from 'qx';
import { uiTheme } from '~/ui-common';
import { UiLayouterPageComponent } from '~/ui-layouter-page';
import { uiStatusModel } from '~/ui-root/zones/common/commonModels/UiStatusModel';
import { HeatmapPage } from '~/ui-root/zones/heatmap/HeatmapPage';
import { CustomWindowFrame } from '~/ui-root/zones/siteFrame/views/window/CustomWindowFrame';
import { DevToolPullTab } from '~/ui-root/zones/siteFrame/views/window/DevToolPullTab';
import { EditorPage } from './zones/editor/EditorPage';
import { FirmwareUpdationPage } from './zones/firmup/FirmwareUpdationPage';
import { PresetBrowserPage } from './zones/presetBrowser/PresetBrowserPage';
import { KeyboardShapePreviewPage } from './zones/shapePreview/ShapePreviewPage';
import { NavigationColumn } from './zones/siteFrame/views/navigation/NavigationColumn';
import { WindowTitleBarSection } from './zones/siteFrame/views/titleBar/WindowTitleBarSection';

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
