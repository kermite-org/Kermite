import { css } from 'goober';
import { h } from 'qx';
import { uiTheme } from '~/ui-common';
import { UiLayouterPageComponent } from '~/ui-layouter-page';
import { UiLayouterPageDevelopmentDummy } from '~/ui-layouter-page/UiLayoutPageDevelopmentDummy';
import { models } from '~/ui-root/models';
import { CustomWindowFrame } from '~/ui-root/views/base/window/CustomWindowFrame';
import { HeatmapPage } from '~/ui-root/views/pages/HeatmapPage';
import { NavigationColumn } from '../base/navigation/NavigationColumn';
import { WindowTitleBarSection } from '../base/titleBar/WindowTitleBarSection';
import { EditorPage } from '../pages/EditorPage';
import { FirmwareUpdationPage } from '../pages/FirmwareUpdationPage';
import { PresetBrowserPage } from '../pages/PresetBrowserPage';
import { KeyboardShapePreviewPage } from '../pages/ShapePreviewPage';

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
  const { page } = models.uiStatusModel.settings;

  return (
    <CustomWindowFrame renderTitleBar={() => <WindowTitleBarSection />}>
      <div css={styles.cssContentRow}>
        <NavigationColumn />
        <div css={styles.cssMainColumn}>
          {page === 'editor' && <EditorPage />}
          {/* {page === 'layouter' && <UiLayouterPageComponent />} */}
          {page === 'layouter' && <UiLayouterPageDevelopmentDummy />}
          {page === 'shapePreview' && <KeyboardShapePreviewPage />}
          {page === 'firmwareUpdation' && <FirmwareUpdationPage />}
          {page === 'presetBrowser' && <PresetBrowserPage />}
          {page === 'heatmap' && <HeatmapPage />}
        </div>
      </div>
    </CustomWindowFrame>
  );
};
